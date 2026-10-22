# Upstream fix preparation

An isolated source checkout of tag `v28.2.0` is on local branch `codex/fix-issue-contract-nullability`. Regression `TestIssueContractAcceptsAbsentAssociations` validates ordinary issue null associations against the generated OpenAPI model.

Status: draft; generator change and before/after verification are in progress. No fix is claimed ready until the regression fails before and passes after regeneration. Nothing has been published upstream.
