# Invoice Template Management

This module provides a complete UI for managing invoice email templates.

## Features

### Template List Page (`/invoice-templates`)
- View all invoice templates
- See which template is set as default (marked with a star badge)
- Create new templates
- Edit existing templates
- Delete templates
- Create a default template with Miniatures.lk branding

### Template Editor (`/invoice-templates/new` and `/invoice-templates/[id]/edit`)
- Create and edit invoice templates
- Live preview of the template with sample data
- HTML editor for template body
- Set template as default
- Available placeholders:
  - `{order_number}` - Order number
  - `{customer_name}` - Customer name
  - `{customer_email}` - Customer email
  - `{order_date}` - Order date
  - `{total_amount}` - Total order amount
  - `{balance}` - Remaining balance
  - `{items}` - Order items (for advanced templates)

## API Integration

The UI integrates with the following backend endpoints:

- `GET /api/invoice-templates` - List all templates
- `GET /api/invoice-templates/{id}` - Get a specific template
- `GET /api/invoice-templates/default` - Get the default template
- `POST /api/invoice-templates` - Create a new template
- `PUT /api/invoice-templates/{id}` - Update a template
- `DELETE /api/invoice-templates/{id}` - Delete a template
- `POST /api/invoice-templates/default` - Create a default template with branding

## Default Template

The system supports one default template at a time. When a template is set as default:
- All other templates are automatically unmarked as default
- The default template is used when sending invoices without specifying a template
- The default template is marked with a star badge in the list

## Branding

The default template includes Miniatures.lk branding with the brand colors:
- Primary: #C9A66B
- Secondary: #EBD3A0
- Dark: #2F2F2F

## Usage

1. Navigate to "Invoice Templates" in the sidebar
2. Click "Create Default Template" to create a template with Miniatures.lk branding
3. Or click "New Template" to create a custom template
4. Edit templates by clicking the "Edit" button
5. Set a template as default by checking the "Set as default template" checkbox
6. Delete templates by clicking the "Delete" button (with confirmation)

## Notes

- Templates use HTML for formatting
- The preview shows how the template will look with sample data
- Deleting the default template will require setting another template as default
- Templates are used when sending invoices from the order detail page
