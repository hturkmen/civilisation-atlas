#!/usr/bin/env python3
"""Preview issue bodies, or create missing issues in an existing hturkmen repo.

No repository creation, deletion, assignment, email, or existing-issue edits.
Live mode requires gh authenticated as hturkmen. Bodies are sent as JSON via
stdin, never interpolated into shell commands. Default is a local preview.
"""
import argparse
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]


def gh_json(arguments, payload=None):
    command = ['gh', 'api', *arguments]
    if payload is not None:
        command += ['--method', 'POST', '--input', '-']
    result = subprocess.run(command, input=json.dumps(payload, ensure_ascii=False) if payload is not None else None,
                            text=True, capture_output=True, check=False)
    if result.returncode:
        raise RuntimeError('GitHub request failed; no further writes attempted. Check gh authentication and repository access.')
    return json.loads(result.stdout) if result.stdout.strip() else {}


def body_for(item, repo, branch):
    marker = '<!-- atlas-task: ' + item['id'] + ' -->'
    hours = item['estimate_hours']
    parts = [
        marker, '',
        'Amaç / çıktı: ' + item['deliverable'], '',
        'Öncelik: ' + item['priority'] + '. Durum: ' + item['status'] + '.',
        'Başlangıç eforu: ' + str(hours['min']) + '–' + str(hours['max']) + ' saat.',
        'Bağımlılıklar: ' + (', '.join(item['depends_on']) or 'yok'), '',
        'Kabul kriterleri:', '',
        *['- [ ] ' + criterion for criterion in item['acceptance_criteria']], '',
        'Doğrulama: ' + item['verification'], '',
        '[Alt proje tasarımı](https://github.com/' + repo + '/blob/' + quote(branch, safe='') + '/docs/projects/' + item['project_id'] + '.md)', '',
        'Tahmin; kapsamlı tarihsel sayısallaştırma, lisans bekleme ve bağımsız uzman incelemesini içermez.',
    ]
    return '\n'.join(parts)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', default='hturkmen/civilisation-atlas')
    parser.add_argument('--apply', action='store_true', help='Create missing GitHub issues in the existing repo')
    args = parser.parse_args()
    if not re.fullmatch(r'hturkmen/[A-Za-z0-9_.-]+', args.repo):
        parser.error('Expected a repository owned by hturkmen')
    data = json.loads((ROOT / 'backlog/issues.json').read_text())
    items = data['items']
    if not args.apply:
        print(json.dumps({'mode': 'local-preview', 'repo': args.repo, 'issue_count': len(items),
                          'writes_performed': 0, 'first_issue_title': '[' + items[0]['id'] + '] ' + items[0]['title'],
                          'first_issue_body': body_for(items[0], args.repo, 'main')},
                         ensure_ascii=False, indent=2))
        return
    if not shutil.which('gh'):
        raise RuntimeError('GitHub CLI gh is required. No write performed.')
    profile = gh_json(['user'])
    if profile.get('login') != 'hturkmen':
        raise RuntimeError('Authenticated GitHub account must be hturkmen. No write performed.')
    metadata = gh_json(['repos/' + args.repo])
    if metadata.get('owner', {}).get('login') != 'hturkmen':
        raise RuntimeError('Repository owner mismatch. No write performed.')
    if metadata.get('archived') or not metadata.get('has_issues'):
        raise RuntimeError('Repository must be active with issues enabled. No write performed.')
    branch = metadata.get('default_branch')
    if not branch:
        raise RuntimeError('Upload the planning package first so the repository has a default branch.')
    # Require the target package to be present before creating links to it.
    gh_json(['repos/' + args.repo + '/contents/backlog/issues.json?ref=' + quote(branch, safe='')])
    existing = set()
    page = 1
    while True:
        records = gh_json(['repos/' + args.repo + '/issues?state=all&per_page=100&page=' + str(page)])
        if not isinstance(records, list):
            raise RuntimeError('Unexpected issue listing response; no write performed.')
        for issue in records:
            if 'pull_request' not in issue:
                existing.update(re.findall(r'<!-- atlas-task: (P\d{2}-\d{3}) -->', issue.get('body') or ''))
        if len(records) < 100:
            break
        page += 1
    created = 0
    for item in items:
        if item['id'] in existing:
            print('Already exists: ' + item['id'])
            continue
        created_issue = gh_json(['repos/' + args.repo + '/issues'],
                               {'title': '[' + item['id'] + '] ' + item['title'],
                                'body': body_for(item, args.repo, branch)})
        if not created_issue.get('number'):
            raise RuntimeError('Issue creation response was incomplete. Stop and inspect before retrying.')
        existing.add(item['id'])
        created += 1
        print('Created ' + item['id'] + ': ' + created_issue['html_url'], flush=True)
    print('Created ' + str(created) + ' issues; existing issues unchanged.')


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, OSError, ValueError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
