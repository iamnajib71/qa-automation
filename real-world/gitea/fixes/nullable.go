// Copyright 2026 The Gitea Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package openapi3gen

import "github.com/getkin/kin-openapi/openapi3"

func applyNullableExtensions(doc *openapi3.T) {
	seen := map[*openapi3.Schema]bool{}
	var visit func(*openapi3.SchemaRef)
	visit = func(ref *openapi3.SchemaRef) {
		if ref == nil || ref.Value == nil || ref.Ref != "" || seen[ref.Value] {
			return
		}
		s := ref.Value
		seen[s] = true
		if nullable, ok := s.Extensions["x-nullable"].(bool); ok && nullable {
			s.Nullable = true
			delete(s.Extensions, "x-nullable")
		}
		for _, property := range s.Properties {
			visit(property)
		}
		visit(s.Items)
		for _, group := range [][]*openapi3.SchemaRef{s.AllOf, s.AnyOf, s.OneOf} {
			for _, member := range group {
				visit(member)
			}
		}
		visit(s.Not)
	}
	for _, schema := range doc.Components.Schemas {
		visit(schema)
	}
}
