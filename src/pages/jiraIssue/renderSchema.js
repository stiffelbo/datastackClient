const jiraIssueDetailsLayout = {
  columns: [7, 5],

  topRows: [
    {
      left: {
        type: "breadcrumbs",
        fields: [
          { name: "jira_project_label", renderAs: "linkedText" },
          { name: "jira_parent_key", fallback: "jira_key", renderAs: "linkedText" },
          { name: "jira_key", optional: true, renderAs: "linkedText" },
        ],
      },
      right: {
        type: "jiraActions",
        fields: [
          { name: "jira_key", renderAs: "jiraChip" },
          { name: "jira_url", renderAs: "externalLink", component: "RenderLink" },
        ],
      },
    },
    {
      left: {
        type: "title",
        field: "name",
        variant: "h6",
      },
      right: {
        type: "statusTimeline",
        fields: [
          { name: "jira_status_category", renderAs: "statusChip" },
          { name: "jira_issue_type", renderAs: "typeChip" },
          { name: "created_at_jira", renderAs: "dateBadge" },
          { name: "updated_at_jira", renderAs: "dateBadge" },
          { name: "resolved_at_jira", renderAs: "dateBadge" },
        ],
      },
    },
  ],

  leftColumn: [
    {
      type: "collapsible",
      title: "Opis",
      key: "description",
      defaultOpen: true,
      fields: [
        { name: "description", renderAs: "jiraDescription" },
      ],
    },
    {
      type: "collapsible",
      title: "Podstawowe / konfiguracja",
      key: "basic_config",
      defaultOpen: true,
      fields: [
        { name: "status", renderAs: "input" },
        { name: "product_group", renderAs: "readonly" },
        { name: "jira_issue_groups_id", renderAs: "select" },
        { name: "contractor_id", renderAs: "select" },
        { name: "is_order", renderAs: "boolean" },
        { name: "is_active", renderAs: "boolean" },
        { name: "ro_nr", renderAs: "input" },
      ],
    },
    {
      type: "collapsible",
      title: "Ilości",
      key: "qty",
      defaultOpen: false,
      fields: [
        { name: "qty_ordered", renderAs: "number" },
        { name: "qty_to_do", renderAs: "number" },
        { name: "qty_done", renderAs: "number" },
        { name: "qty_invoiced", renderAs: "number" },
        { name: "qty_dispatched", renderAs: "number" },
      ],
    },
    {
      type: "collapsible",
      title: "Finanse",
      key: "finance",
      defaultOpen: false,
      fields: [
        { name: "design_price", renderAs: "money" },
        { name: "setup_price", renderAs: "money" },
        { name: "unit_price", renderAs: "money" },
        { name: "currency", renderAs: "input" },
        { name: "conversion_rate", renderAs: "number" },
        { name: "budget_net", renderAs: "money" },
        { name: "planned_margin_pct", renderAs: "percent" },
        { name: "planned_revenue_net", renderAs: "money" },
        { name: "committed_costs_net", renderAs: "money" },
        { name: "invoiced_revenue_net", renderAs: "money" },
        { name: "cash_received_net", renderAs: "money" },
      ],
    },
  ],

  rightColumn: [
    {
      type: "collapsible",
      title: "Osoby",
      key: "people",
      defaultOpen: true,
      fields: [
        { name: "reporter_id", renderAs: "readonlyPerson" },
        { name: "assignee_id", renderAs: "readonlyPerson" },
        { name: "production_manager_id", renderAs: "selectPerson" },
        { name: "account_manager_id", renderAs: "selectPerson" },
      ],
    },
    {
      type: "collapsible",
      title: "Log / synchronizacja",
      key: "log_sync",
      defaultOpen: false,
      fields: [
        { name: "created_at_jira", renderAs: "readonlyDateTime" },
        { name: "updated_at_jira", renderAs: "readonlyDateTime" },
        { name: "resolved_at_jira", renderAs: "readonlyDateTime" },
        { name: "jira_synced_at", renderAs: "readonlyDateTime" },
        { name: "created_at", renderAs: "readonlyDateTime" },
        { name: "updated_at", renderAs: "readonlyDateTime" },
        { name: "is_active_date", renderAs: "readonlyDateTime" },
      ],
    },
  ],
};