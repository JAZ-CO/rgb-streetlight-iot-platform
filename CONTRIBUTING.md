# Contributing Guide

## Branching
- `main`: stable branch
- Use feature branches such as:
  - `feature/backend-api`
  - `feature/frontend-dashboard`
  - `feature/node1-firmware`
  - `feature/openstack-deploy`

## Rules
- Do not push directly to `main`
- Open an issue before starting major work
- Create a pull request for each feature
- Link each PR to an issue
- Require one teammate review before merge

## Commit style
Use clear commit messages, for example:
- `feat: add telemetry ingestion endpoint`
- `fix: correct node1 motion threshold logic`
- `docs: add mqtt topic specification`

## Definition of Done
A task is done only when:
- code works
- code is pushed
- docs are updated
- tests are added or updated where relevant
- the other teammate can understand and run it
