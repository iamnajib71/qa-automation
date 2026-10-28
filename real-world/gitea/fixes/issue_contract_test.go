// Copyright 2026 The Gitea Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package openapi3gen

import (
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
)

func TestIssueContractAcceptsAbsentAssociations(t *testing.T) {
	doc, err := openapi3.NewLoader().LoadFromFile("../../templates/swagger/v1-openapi3.generated.json")
	if err != nil {
		t.Fatal(err)
	}
	issue := map[string]any{
		"pull_request": nil,
		"milestone": nil,
		"assignee": nil,
		"closed_at": nil,
		"due_date": nil,
	}
	if err := doc.Components.Schemas["Issue"].Value.VisitJSON(issue); err != nil {
		t.Fatalf("ordinary issue with no associated PR, milestone or assignee must match its response contract: %v", err)
	}
	issue["pull_request"] = "not-a-pull-request-object"
	if err := doc.Components.Schemas["Issue"].Value.VisitJSON(issue); err == nil {
		t.Fatal("non-null pull_request must still satisfy the referenced object schema")
	}
}
