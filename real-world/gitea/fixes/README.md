# Upstream fix preparation

An isolated source checkout of tag `v28.2.0` is on local branch `fix/issue-contract-nullability`. Regression `TestIssueContractAcceptsAbsentAssociations` validates ordinary issue null associations against the generated OpenAPI model.

The regression fails against the original contract and passes after regeneration, both locally and in [GitHub Actions](https://github.com/iamnajib71/qa-automation/actions/runs/39808735930). The complete `build/openapi3gen` package also passes. [Before](before.txt) and [after](after.txt) are actual CI logs. Nothing has been published upstream.

The fix enables nullable-pointer generation for Swagger and preserves nullable references through OpenAPI 3 conversion. The regression accepts absent issue associations while still rejecting an invalid string for the PR object. Both generated contracts are included in the [portable patch](gitea-nullability.patch).

Source base: tag `v28.2.0`, commit `829b49c1ae96015e345f9d2a0eb1ea7acd5f31e1`. Local source commit: `e09bf8093e5b306c791cad30208c061d85e8906a`. The isolated checkout is `.verification/gitea-upstream`; its branch is `fix/issue-contract-nullability`. That ignored checkout is not part of this repository's public history; use the portable patch after cloning Gitea.

```sh
git switch -c fix-issue-contract-nullability v28.2.0
git am /path/to/gitea-nullability.patch
go test -run '^TestIssueContractAcceptsAbsentAssociations$' ./build/openapi3gen/
go test ./build/openapi3gen/
```

These are contract-generator checks, not a full Gitea integration or release qualification. The unmodified Docker target's failures remain in the separate QA reports. Review and rebase the patch onto the intended upstream development branch before submission.

Contributor checks: `make help`, `make generate-swagger`, `make fmt` and `make lint-go` completed in the isolated checkout. Formatting left the committed source unchanged; Go lint reported **0 issues**. [Actual formatting/lint log](format-lint.txt). No Go module dependencies were changed.
