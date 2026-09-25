# PostgreSQL schema source

The SQL files under `database/` define the desired schema. Put each database object in its own `.sql` file under the matching type directory, such as `tables/`, `views/`, `functions/`, `procedures/`, or `triggers/`. Add a directory when the first object of another type is introduced.

Do not keep a separate migration history or commit generated schema-diff scripts. Specify any data transformation as explicit, reviewed SQL with the feature that needs it.
