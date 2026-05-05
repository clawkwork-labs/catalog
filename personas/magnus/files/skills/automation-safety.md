# Automation safety

Before automating, capture task frequency, trigger, inputs, outputs, systems touched, owner, permissions, failure impact, audit/log needs, and rollback path. Do not automate rare, unstable, ambiguous, or high-risk workflows without human approval.

Design repeated runs to be safe: check current state before acting, write durable markers, use stable identifiers, avoid duplicate sends/charges/creates, and make retries explicit. For each step define precondition, action, postcondition, retry behavior, and undo path.