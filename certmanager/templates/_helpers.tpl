{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "certmanager.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "certmanager.hostname" -}}
http{{- if .Values.ingress.tls_secret_name }}s{{- end }}://{{ .Values.ingress.hostname }}
{{- end -}}