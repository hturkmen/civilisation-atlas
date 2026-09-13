#!/usr/bin/env python3
"""Dependency-free structural checks. Not a full OpenAPI standards validator."""
import json
from pathlib import Path
import re
import os

ROOT = Path(__file__).resolve().parents[1]
errors = []
backlog = json.loads((ROOT / 'backlog/issues.json').read_text())
items = backlog['items']
ids = [item['id'] for item in items]
if len(set(ids)) != len(ids):
    errors.append('Duplicate task id')
by_id = {item['id']: item for item in items}
project_ids = {p['id'] for p in backlog['projects']}
visiting, visited = set(), set()


def walk(task_id):
    if task_id in visiting:
        errors.append('Dependency cycle at ' + task_id)
        return
    if task_id in visited:
        return
    if task_id not in by_id:
        errors.append('Missing dependency ' + task_id)
        return
    visiting.add(task_id)
    for dependency in by_id[task_id]['depends_on']:
        walk(dependency)
    visiting.remove(task_id)
    visited.add(task_id)


for item in items:
    walk(item['id'])
    if item['project_id'] not in project_ids:
        errors.append('Unknown project: ' + item['id'])
    if not item['acceptance_criteria'] or not item['verification'] or not item['deliverable']:
        errors.append('Incomplete task: ' + item['id'])
    if not 0 < item['estimate_hours']['min'] <= item['estimate_hours']['max']:
        errors.append('Invalid estimate: ' + item['id'])
    page = ROOT / 'docs/projects' / (item['project_id'] + '.md')
    if not page.is_file() or item['id'] not in page.read_text():
        errors.append('Missing project documentation: ' + item['id'])

spec = json.loads((ROOT / 'packages/contracts/openapi.json').read_text())
operation_ids = set()
operation_count = 0


def check_refs(node):
    if isinstance(node, dict):
        if '$ref' in node:
            ref = node['$ref']
            if not ref.startswith('#/'):
                errors.append('Unresolved external schema reference: ' + ref)
            else:
                target = spec
                try:
                    for key in ref[2:].split('/'):
                        target = target[key.replace('~1', '/').replace('~0', '~')]
                except (KeyError, TypeError):
                    errors.append('Broken schema reference: ' + ref)
        for value in node.values():
            check_refs(value)
    elif isinstance(node, list):
        for value in node:
            check_refs(value)


check_refs(spec)
for path, operations in spec['paths'].items():
    required_path_names = set(re.findall(r'{([^}]+)}', path))
    for method, operation in operations.items():
        if method not in {'get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'}:
            continue
        operation_count += 1
        oid = operation.get('operationId')
        if not oid or oid in operation_ids:
            errors.append('Missing/duplicate operationId: ' + path)
        operation_ids.add(oid)
        declared = {p['name'] for p in operation.get('parameters', []) if p.get('in') == 'path' and p.get('required')}
        if declared != required_path_names:
            errors.append('Path parameter mismatch: ' + path)
        if ('/admin/' in path or path == '/api/v1/me' or path.startswith('/api/v1/me/')) and not operation.get('security'):
            errors.append('Private operation missing authentication: ' + oid)
        if not operation.get('responses'):
            errors.append('Missing responses: ' + oid)

SKIP_DIRS = {'.git', 'node_modules', '.next', 'dist', 'coverage', '__pycache__',
             'playwright-report', 'test-results'}


def project_files(suffix):
    for directory, dirs, files in os.walk(ROOT):
        dirs[:] = [name for name in dirs if name not in SKIP_DIRS]
        for name in files:
            if name.endswith(suffix):
                yield Path(directory) / name


for file in project_files('.md'):
    for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)', file.read_text()):
        if target.startswith(('http:', 'https:', 'mailto:', '#', 'sandbox:')):
            continue
        local = target.split('#', 1)[0]
        if local and not (file.parent / local).exists():
            errors.append('Broken local link in ' + str(file.relative_to(ROOT)) + ': ' + target)
for file in project_files('.json'):
    try:
        json.loads(file.read_text())
    except ValueError:
        errors.append('Invalid JSON: ' + str(file.relative_to(ROOT)))

if errors:
    for error in errors:
        print('ERROR:', error)
    raise SystemExit(1)
print(json.dumps({'result':'passed', 'tasks':len(items), 'projects':len(project_ids),
                  'api_operations':operation_count, 'api_schemas':len(spec['components']['schemas']),
                  'checks':['dependency graph', 'task completeness', 'local Markdown links',
                            'JSON parsing', 'OpenAPI local refs', 'operation IDs',
                            'path parameters', 'private endpoint auth declarations'],
                  'not_checked':['formal OpenAPI conformance', 'live API', 'database migrations/RLS',
                                 'frontend UX', 'GitHub writes', 'historical factual accuracy']},
                 ensure_ascii=False, indent=2))
