# Supabase integration

Supabase is the planned PostgreSQL data service. The client accessor is lazy: importing the backend does not initialize a client, validate credentials, or connect to the service. A request for the client requires `SUPABASE_URL` and `SUPABASE_KEY` to be configured in the backend environment.

Database schema design, connection setup, migrations, and data access will be implemented later. This scaffold creates no tables and performs no database operations.
