#!/bin/bash
# ralph.sh

PROMPT="Read CLAUDE.md and PROJECT_CONTEXT.md. 
Phase 1: Project Initialization.
Tasks:
1. Create tasks/todo.md and plan.
2. Init Next.js 15 (App Router, TS, Tailwind, --no-eslint).
3. Install lucide-react, clsx.
4. Init Shadcn (button, input, card).
5. Create app/page.tsx with 'GearGrab' hero.
6. Write/Run Playwright test tests/home.spec.ts.
Constraint: Fix errors until test passes. Output PHASE1_DONE when finished."

while true; do
  echo "🔄 Ralph is working..."
  # Pipe the prompt to claude and save output
  claude -p "$PROMPT" | tee last_run.log
  
  # Check if "PHASE1_DONE" is in the output
  if grep -q "PHASE1_DONE" last_run.log; then
    echo "✅ Loop Complete: Phase 1 Done!"
    break
  fi
  
  echo "❌ Test failed or not done. Retrying..."
done