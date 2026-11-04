# BC Logistics LLC Discord Server & Operations Plan

## Identity and scale
- Company: BC Logistics LLC
- Business: regional transportation, warehousing, and wholesale distribution
- Fleet target: 300+ company trucks
- Workforce planning capacity: 600+ employees
- Distribution center: 24/7
- Customer base: wholesale / business-to-business only

These are planning targets, not claims of current fleet or employee counts.

## Discord structure
The setup command will add the following business categories while retaining existing channels and history:
- CORPORATE HEADQUARTERS: welcome, company announcements, company information, handbook, rules, company updates
- HUMAN RESOURCES: employment applications, employee directory, employee support, onboarding, training, leave and promotion requests
- TRANSPORTATION & FLEET: company fleet, driver check-in, vehicle assignments, fleet inspections, maintenance reports, fuel reports
- DISPATCH & LOAD PLANNING: wholesale load board, load assignments, active shipments, delivery confirmations, dispatch reports, appointment schedule
- DISTRIBUTION CENTER: warehouse operations, receiving, outbound shipping, dock schedule, inventory control, cross-dock, cold storage
- WHOLESALE CUSTOMER SERVICES: wholesale accounts, customer support, shipment inquiries, claims
- CARRIER SERVICES: carrier registration, carrier check-in, carrier appointments, carrier staging, carrier notices
- SAFETY & COMPLIANCE: safety reports, incident reports, compliance updates, training records
- FACILITY SECURITY: security operations, gate reports, access issues, emergency coordination
- FINANCE & ADMINISTRATION: payroll support, procurement, invoices, budget and department requests
- PRIVATE STAFF AREAS: executive office, HR staff, dispatch staff, warehouse leadership, safety leadership, finance staff

## Access principles
- Public information is separate from employee-only and management-only channels.
- Employee records, applications, payroll, customer data, carrier documents, and incident reports must remain restricted.
- Company drivers and employees are separate from outside carrier partners.
- Outside carriers receive access only to the carrier-facing information and workflows they need.
- Preserve existing channels, roles, messages, and history; no destructive server rebuild.

## Operating rules
- 24/7 distribution center coverage is a company operating target.
- Wholesale and business customers only; no direct-to-consumer retail positioning.
- Company fleet remains the primary transportation model.
- Approved outside carriers are registered freight partners, not automatically employees.
- Do not publish private employee, customer, shipment, or security information in public channels.


## Department permission model
- Human Resources: HR Director, HR Manager, Recruiter, and authorized leadership; the general Employee role can view employee-facing information but not HR staff records.
- Transportation & Fleet: transportation/fleet leadership, assigned company drivers, driver trainers, maintenance, and relevant safety roles.
- Dispatch & Load Planning: dispatch leadership and dispatchers, load planners, transportation management, warehouse leadership, and company drivers who need load information.
- Distribution Center: warehouse leadership, warehouse associates, forklift operators, receiving/shipping, cold storage, dispatch, and assigned company drivers.
- Wholesale Customer Services: wholesale account staff and authorized carrier/dispatch management.
- Carrier Services: carrier relations staff, approved Carrier Partner role, and dispatch management. Individual registration tickets are private to the applicant and carrier reviewers.
- Safety & Compliance: safety/compliance staff, HR leadership, trainers, and affected operating roles.
- Facility Security: security staff, security leadership, and facilities leadership.
- Finance & Administration: finance, payroll, procurement, IT/facilities leadership, and executive management.
- Executive, HR staff, dispatch/warehouse leadership, and safety/finance staff categories remain restricted.
- Public company information and community channels remain separate from confidential operational records.
- The legacy ATS/ETS2 simulator community is retained and is not reconfigured by the business department permission map.

## Hiring workflow
1. Applicant opens Careers and signs in with Discord.
2. Applicant selects one of the 12 departments and a position of interest.
3. A private HR application ticket is created; applicant and HR reviewers can access it.
4. HR reviews the application in the management portal and may approve, deny, request information, or place it on hold.
5. Approval grants the general Employee role. HR assigns the specific department/job role after onboarding and verification.
6. HR records onboarding/training and any later promotions or leave requests in the appropriate restricted channels.

## Wholesale freight workflow
1. Dispatch creates a load using `/load create` with customer, origin, destination, cargo, equipment, and appointment details.
2. Dispatch assigns an approved company driver and unit using `/load assign`.
3. Dispatch updates progress using `/load status`; status notices are copied to active shipments.
4. Delivered loads are posted to delivery confirmations. Existing ATS/ETS2 telemetry remains a separate simulator workflow.

## Outside carrier workflow
1. A prospective carrier submits `/carrier-register`; the bot creates a private registration ticket.
2. Carrier Services verifies company identity, operating authority, equipment, service area, and insurance documents through an approved secure process.
3. An authorized reviewer uses `/carrier-review` to approve or decline.
4. Approval grants only the separate `Carrier Partner` role. It does not make the carrier an employee or grant access to internal fleet, payroll, or HR records.
