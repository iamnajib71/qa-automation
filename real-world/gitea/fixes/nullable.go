// Copyright 2026 The Gitea Authors. All rights reserved.
// SPDX-License-Identifier: MIT

package openapi3gen

import (
	"gitea.dev/modules/json"

	"github.com/getkin/kin-openapi/openapi3"
)

func applyNullableReferences(doc *openapi3.T, swaggerJSON []byte) error {
	var source struct {
		Definitions map[string]any `json:"definitions"`
	}
	if err := json.Unmarshal(swaggerJSON, &source); err != nil {
		return err
	}
	var visit func(any, *openapi3.SchemaRef)
	visit = func(input any, ref *openapi3.SchemaRef) {
		raw, ok := input.(map[string]any)
		if !ok || ref == nil {
			return
		}
		if nullable, _ := raw["x-nullable"].(bool); nullable && ref.Ref != "" {
			// The converter drops siblings of $ref; preserve nullability on a wrapper.
			target := ref.Ref
			ref.Ref = ""
			ref.Value = &openapi3.Schema{Nullable: true, AllOf: []*openapi3.SchemaRef{{Ref: target}}}
		}
		if ref.Value == nil {
			return
		}
		properties, _ := raw["properties"].(map[string]any)
		for name, property := range ref.Value.Properties {
			visit(properties[name], property)
		}
		visit(raw["items"], ref.Value.Items)
		for name, group := range map[string][]*openapi3.SchemaRef{"allOf": ref.Value.AllOf, "anyOf": ref.Value.AnyOf, "oneOf": ref.Value.OneOf} {
			inputs, _ := raw[name].([]any)
			for index, member := range group {
				if index < len(inputs) {
					visit(inputs[index], member)
				}
			}
		}
	}
	if doc.Components == nil {
		return nil
	}
	for name, schema := range doc.Components.Schemas {
		visit(source.Definitions[name], schema)
	}
	return nil
}
