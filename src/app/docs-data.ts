export type GuideStep = {
  title: string;
  body: string;
  list?: string[];
  code?: string;
  note?: string;
};

export type Guide = {
  id: string;
  group: string;
  title: string;
  eyebrow: string;
  summary: string;
  readTime: string;
  steps: GuideStep[];
  tags: string[];
};

export const guides: Guide[] = [
  {
    id: "introduction",
    group: "Start here",
    title: "Introduction to LenAPI",
    eyebrow: "GUIDE 01 · OVERVIEW",
    summary: "A lightweight ASGI framework that helps developers spin up APIs quickly in a few steps.",
    readTime: "3 min",
    tags: ["introduction", "overview", "asgi", "pydantic", "sqlalchemy", "framework"],
    steps: [
      {
        title: "What is LenAPI?",
        body: "LenAPI is a lightweight Python ASGI framework shaped by real-world backend development. It helps developers spin up APIs quickly in a few steps, with routing, validation, data access, and interactive documentation in one toolkit.",
      },
      {
        title: "What can you build with it?",
        body: "Key features include:",
        list: [
          "Typed routes, Pydantic validation, and interactive Swagger/OpenAPI docs",
          "ORM models, migrations, and sync or async database access",
          "Authentication options including JWT, API keys, sessions, OIDC, and social sign-in",
          "WebSockets for chat, video signaling, JSON, text, and binary messages",
          "Built-in webhook handling for flexible JSON payloads and verified senders",
          "Caching, background tasks, file uploads, middleware, and request throttling",
          "Optional OpenAI, Ollama, and Faker integrations",
        ],
      },
      {
        title: "How this documentation is organized",
        body: "Start with the quickstart to install LenAPI and create your first app. Then follow the guides for routing, validation, data access, security, realtime features, testing, and deployment. Each guide includes practical code you can adapt.",
        code: `from lenapi import LENAPI\n\napp = LENAPI()\n\n@app.get("/health")\ndef health():\n    return {"status": "ok"}`,
        note: "The generated development server defaults to http://127.0.0.1:8009, and Swagger UI is available at /docs/.",
      },
    ],
  },
  {
    id: "quickstart",
    group: "Start here",
    title: "Build your first LenAPI app",
    eyebrow: "GUIDE 02 · FOUNDATIONS",
    summary: "Install the framework, generate an app, and run a typed API locally.",
    readTime: "5 min",
    tags: ["install", "project", "server", "quickstart"],
    steps: [
      {
        title: "Install LenAPI",
        body: "Install from PyPI with pip, or use uv. In a uv-managed project, uv add records LenAPI in pyproject.toml and syncs the environment; uv pip install installs it into the active environment.",
        code: `# pip\npython -m pip install lenapi\n\n# Add LenAPI to a uv-managed project\nuv add lenapi\n\n# Or install into the active environment with uv\nuv pip install lenapi`,
      },
      {
        title: "Generate the application scaffold",
        body: "The scaffold separates application code from framework internals. It includes settings, a main module, app models and schemas, tests, and migrations.",
        code: `lenora startproject myproject\ncd myproject`,
      },
      {
        title: "Add a typed route",
        body: "LenAPI reads the Pydantic model from the handler signature, validates the incoming JSON body, and documents the operation in OpenAPI.",
        code: `from pydantic import BaseModel\nfrom lenapi import LENAPI, Router\n\napp = LENAPI()\napi = Router(prefix="/api")\n\nclass Greeting(BaseModel):\n    name: str\n\n@api.post("/hello")\nasync def hello(data: Greeting):\n    return {"message": f"Hello, {data.name}!"}\n\napp.include_router(api)`,
      },
      {
        title: "Migrate, then run",
        body: "Migrations are explicit. The first migration includes framework-owned tables and discovers models imported by the application.",
        code: `python lenora.py migration\npython lenora.py run`,
        note: "The default development address is http://127.0.0.1:8009. Open /docs/ to try the endpoint in Swagger UI.",
      },
    ],
  },
  {
    id: "routing",
    group: "Build APIs",
    title: "Routes and routers",
    eyebrow: "GUIDE 03 · HTTP ROUTING",
    summary: "Organize endpoints with app decorators, reusable routers, prefixes, tags, and all common HTTP verbs.",
    readTime: "6 min",
    tags: ["get", "post", "put", "patch", "delete", "router", "tag", "swagger"],
    steps: [
      {
        title: "Register a route on the app",
        body: "Use route decorators directly on LENAPI for a small API. Typed values that are not in the path are query parameters; values whose names appear in the path are path parameters. LenAPI includes both in the OpenAPI document, where you can try them in Swagger UI.",
        code: `from lenapi import LENAPI\n\napp = LENAPI()\n\n# item_id is a query parameter: GET /items/?item_id=12\n@app.get("/items/")\ndef get_item(item_id: int):\n    return {"item_id": item_id}\n\n# item_id is a path parameter: GET /items/12\n@app.get("/items/{item_id}")\ndef get_item_by_id(item_id: int):\n    return {"item_id": item_id}`,
      },
      {
        title: "Define the request schema in the app",
        body: "Keep Pydantic request and response models in the generated app/schemas.py module. Import Greeting in the route module; LenAPI uses that annotation to validate the JSON body and publish the Greeting fields in Swagger.",
        code: `# app/schemas.py\nfrom pydantic import BaseModel\n\nclass Greeting(BaseModel):\n    name: str`,
      },
      {
        title: "Group endpoints with a Router",
        body: "Routers let you keep related endpoints together. The router prefix is prepended to each route path. Import the request schema from app.schemas so Swagger can display its request body for this endpoint.",
        code: `# main.py\nfrom lenapi import LENAPI, Router\nfrom app.schemas import Greeting\n\napp = LENAPI()\napi = Router(prefix="/api", tag_name="Greeting")\n\n@api.post("/hello")\nasync def hello(data: Greeting):\n    return {"message": f"Hello, {data.name}!"}\n\napp.include_router(api)`,
        note: "This registers POST /api/hello. In /docs/, Swagger shows the Greeting request schema and lets you send a JSON body such as {\"name\": \"Ada\"}.",
      },
      {
        title: "Choose the HTTP method and organize Swagger tags",
        body: "Use GET to read, POST to create, PUT to replace, PATCH to partially update, and DELETE to remove a resource. A router tag supplies the default group in Swagger. A tag on include_router can set the group for mounted routes, while a route tag lets you label an individual operation.",
        code: `@api.patch("/users/{user_id}", tag_name="User edits")\ndef patch_user(user_id: int, data: UserPatch):\n    return {"id": user_id, "updated": True}\n\n# The mount tag is used to group the router's endpoints in Swagger.\napp.include_router(api, tag_name="Public API")`,
        note: "Use PATCH for partial updates and PUT when the request replaces the resource representation. You can include multiple routers on one app, each with its own prefix and Swagger tag.",
      },
    ],
  },
  {
    id: "validation",
    group: "Build APIs",
    title: "Request and response schemas",
    eyebrow: "GUIDE 04 · PYDANTIC VALIDATION",
    summary: "Validate request bodies with Pydantic and describe response shapes in Swagger.",
    readTime: "7 min",
    tags: ["pydantic", "schema", "body", "response_model", "validation", "webhook"],
    steps: [
      {
        title: "Define the Student database model",
        body: "The Pydantic schemas below describe API input and output; the ORM model defines the table where records are stored. Put Student in app/models.py, import it from main.py for migration discovery, and run the migration command before using these routes.",
        code: `# app/models.py\nfrom lenapi import model\n\nclass Student(model.Model):\n    person_name = model.StringField(max_length=120, unique=True)\n    course = model.StringField(max_length=120)\n\n# Generate and apply the table migration:\n# python lenora.py migration`,
      },
      {
        title: "Define request and response schemas",
        body: "Keep API schemas in app/schemas.py. Field constraints validate incoming JSON, while from_attributes lets the response schema read fields from the SQLAlchemy-backed Student instance.",
        code: `# app/schemas.py\nfrom pydantic import BaseModel, ConfigDict, Field\n\nclass StudentCreate(BaseModel):\n    person_name: str = Field(min_length=1, max_length=120)\n    course: str = Field(min_length=1, max_length=120)\n\nclass StudentOutput(BaseModel):\n    model_config = ConfigDict(from_attributes=True)\n    id: int\n    person_name: str\n    course: str`,
      },
      {
        title: "Use the schemas in routes and inspect Swagger",
        body: "A Pydantic model parameter becomes the JSON request body. response_model documents and validates the response. The Student model performs the database operations, so the example is connected end to end.",
        code: `# main.py\nfrom lenapi import LENAPI\nfrom app.models import Student\nfrom app.schemas import StudentCreate, StudentOutput\n\napp = LENAPI()\n\n@app.post("/students", response_model=StudentOutput)\ndef create_student(data: StudentCreate):\n    return Student.create(\n        person_name=data.person_name,\n        course=data.course,\n    )\n\n@app.get("/students/{student_id}", response_model=StudentOutput)\ndef get_student(student_id: int):\n    return Student.get_or_404(id=student_id)\n\n@app.get("/students", response_model=list[StudentOutput])\ndef list_students(limit: int = 20, offset: int = 0):\n    return Student.all().all(limit=limit, offset=offset)`,
        note: "Open /docs/: POST /students shows the StudentCreate JSON body, GET /students/{student_id} shows the integer path parameter, and GET /students shows limit and offset as query parameters. All three document StudentOutput responses.",
      },
      {
        title: "Accept arbitrary webhook JSON when needed",
        body: "If an external sender has a variable payload, use Body with Any to accept arbitrary JSON. Verify the sender separately with webhook authentication.",
        code: `from typing import Any\nfrom lenapi import Body\n\n@app.post("/webhooks/events")\nasync def receive_event(payload: Any = Body()):\n    return payload`,
      },
    ],
  },
  {
    id: "uploads",
    group: "Build APIs",
    title: "Image upload and media serving",
    eyebrow: "GUIDE 05 · FILES",
    summary: "Accept multipart uploads, save public or private files, and serve private files only through authorized routes.",
    readTime: "6 min",
    tags: ["upload", "image", "multipart", "media_root", "form data"],
    steps: [
      {
        title: "Configure media storage",
        body: "MEDIA_ROOT and MEDIA_URL are for files intended to be public. New projects use MEDIA_URL='/' for short URLs such as /<generated-name>.jpg when a file is saved directly into MEDIA_ROOT. PRIVATE_MEDIA_ROOT stores files without a public URL; serve those only from authenticated routes after checking access to the specific record.",
        code: `# settings.py\nfrom pathlib import Path\nBASE_DIR = Path(__file__).resolve().parent\nMEDIA_ROOT = BASE_DIR / "media"\nMEDIA_URL = "/"  # generated files saved at the root of MEDIA_ROOT\nPRIVATE_MEDIA_ROOT = BASE_DIR / "private_media"`,
      },
      {
        title: "Add a profile image to Student",
        body: "Store the uploaded image path on the existing Student record. Add profile_image to app/models.py and create a migration so the database gets the new column.",
        code: `# app/models.py — add this field to Student\nprofile_image = model.ImageField(\n    upload_to="profiles",\n    nullable=True,\n)\n\n# Apply the schema change\npython lenora.py migration`,
      },
      {
        title: "Accept an image in Swagger and save it to Student",
        body: "Declare the file as UploadFile = File(...). LenAPI generates the multipart file chooser in Swagger. Save without a directory to write directly under MEDIA_ROOT; store the returned relative filename in Student.profile_image. The generated URL is then /<filename>, without /media/ or a folder segment.",
        code: `from lenapi import File, UploadFile\nfrom app.models import Student\n\n@app.post("/students/{student_id}/profile-image")\nasync def upload_student_image(\n    student_id: int,\n    image: UploadFile = File(...),\n):\n    student = Student.get_or_404(id=student_id)\n    filename = await image.save()  # MEDIA_ROOT/<generated-name>.jpg\n    student.profile_image = filename\n    student.save()\n\n    return {\n        "student_id": student.id,\n        "profile_image": student.profile_image,\n        "image_url": f"/{filename}",\n    }`,
      },
      {
        title: "Create a Student with an uploaded image",
        body: "For a new record, save the file first and pass its relative filename into Student.create. With MEDIA_URL='/' and no save directory, its public URL is /<filename>.",
        code: `filename = await image.save()\n\nstudent = Student.create(\n    person_name="Ada",\n    course="Python",\n    profile_image=filename,\n)\n\nreturn {\n    "id": student.id,\n    "person_name": student.person_name,\n    "profile_image": student.profile_image,\n    "image_url": f"/{filename}",\n}`,
      },
      {
        title: "Serve and reference the image",
        body: "The database stores only the relative filename on Student.profile_image; the upload bytes live under MEDIA_ROOT. With MEDIA_URL='/', LenAPI serves a matching top-level file at /<filename> and lets normal routes continue when no file exists. Files saved into subdirectories retain those path segments.",
        code: `# Example database value on Student.profile_image\n7bcbf310be6a4ca88dd810807da8a95a.jpg\n\n# Public URL returned by the endpoint\n/7bcbf310be6a4ca88dd810807da8a95a.jpg`,
        note: "Image saves validate JPEG, PNG, GIF, WebP, and BMP signatures. This checks format consistency; it is not malware scanning. Use save('documents', type='pdf') for PDFs, type='doc' for DOC/DOCX, or type=None for any file. Names are sanitized and existing files are never overwritten. Set MEDIA_URL='/media/' to retain the conventional prefixed route, or use save('profiles') if you want a folder in the URL. Configure a reverse proxy or object storage for production-scale media delivery.",
      },
      {
        title: "Save a private image",
        body: "Pass private=True to save beneath PRIVATE_MEDIA_ROOT. Store its relative path in a dedicated model field. Public media URLs cannot serve this file.",
        code: `# app/models.py — add a separate field for private files\nprivate_profile_image = model.ImageField(\n    upload_to="profiles",\n    nullable=True,\n)\n\n# main.py\nfrom lenapi import Depends, File, HTTPException, UploadFile\nfrom app.models import Student\n\n@app.post(\n    "/students/{student_id}/private-image",\n    auth=app.authenticator,\n)\nasync def upload_private_student_image(\n    student_id: int,\n    image: UploadFile = File(...),\n    identity=Depends(app.authenticator),\n):\n    student = Student.get_or_404(id=student_id)\n    if not can_edit_student(identity, student):\n        raise HTTPException(404, "Not found")\n\n    filename = await image.save("profiles", private=True)\n    student.private_profile_image = f"profiles/{filename}"\n    student.save()\n    return {"student_id": student.id, "saved": True}`,
        note: "Keep private and public file paths in separate fields so the application does not accidentally return a private path as a public media URL. Never take the path passed to private_file directly from a request parameter; load it from the authorized record. Add malware scanning if your threat model requires it.",
      },
      {
        title: "Serve a private image after authorization",
        body: "Protect the route with the application's authenticator, then check record ownership or another access rule before calling app.private_file. The helper enforces private-root path containment, disables caching, and sends non-image files as downloads. It does not decide whether a caller may access a record.",
        code: `from lenapi import Depends, HTTPException\n\n@app.get(\n    "/students/{student_id}/private-image",\n    auth=app.authenticator,\n)\ndef private_student_image(\n    student_id: int,\n    identity=Depends(app.authenticator),\n):\n    student = Student.get_or_404(id=student_id)\n\n    # Implement this check using your identity format and ownership model.\n    if not can_view_student(identity, student):\n        raise HTTPException(404, "Not found")\n\n    if not student.private_profile_image:\n        raise HTTPException(404, "Not found")\n    return app.private_file(student.private_profile_image, inline=True)`,
        note: "Use the same ownership check on upload and download routes. Returning 404 for inaccessible records avoids confirming that another user's file exists.",
      },
    ],
  },
  {
    id: "models",
    group: "Data layer",
    title: "Models and fields",
    eyebrow: "GUIDE 06 · ORM BASICS",
    summary: "Declare SQLAlchemy-backed tables with model.Model and typed fields, then evolve them through migrations.",
    readTime: "8 min",
    tags: ["model", "orm", "field", "foreign key", "many to many", "sqlite", "mysql", "postgres"],
    steps: [
      {
        title: "Import model helpers and define a model",
        body: "Import the model namespace, then subclass model.Model. Model.Model is the SQLAlchemy-backed base class: each subclass maps to a table named after the class in lowercase, and gets an integer id unless you declare another primary key. Fields such as model.StringField are column declarations.",
        code: `from lenapi import model\n\nclass Classroom(model.Model):\n    name = model.StringField(max_length=120, unique=True)\n\nclass Student(model.Model):\n    person_name = model.StringField(max_length=120, unique=True)\n    course = model.StringField(max_length=120)\n    classroom_id = model.ForeignKeyField(\n        "classroom.id", nullable=True, model=model.null\n    )`,
      },
      {
        title: "Choose appropriate field types",
        body: "Fields include AutoField, IntegerField, BigIntegerField/BigIntField, StringField, TextField, EmailField, PhoneField, IPField, BooleanField, FloatField, DecimalField, DateTimeField, JSONField/Json, UUIDField, ImageField, ForeignKeyField, and ManyToManyField. Most fields default to nullable=True and blank=True; BooleanField defaults to True. JSONField stores JSON-compatible dictionaries, lists, strings, numbers, booleans, or null. Use a factory such as default=dict for mutable defaults.",
        code: `class ExamResult(model.Model):\n    score = model.DecimalField(max_digits=6, decimal_places=2)\n    details = model.Json(default=dict)\n    is_published = model.BooleanField(default=False, nullable=False)\n\nresult = ExamResult.create(\n    score=92.50,\n    details={"course": "Python", "attempt": 1},\n    is_published=True,\n)`,
        note: "Use Pydantic request schemas to validate incoming values too. Database field types alone do not validate an API payload.",
      },
      {
        title: "Use unique fields and unique lookups",
        body: "Set unique=True on a field when the database must reject duplicate values. LenAPI assigns a stable constraint name automatically, so an explicit name is not required. Model.get.unique('field') is a lookup projection that returns only the chosen field; it does not create a database constraint. Use a unique field such as username or email when you need the database to guarantee one matching record.",
        code: `from lenapi import model\n\nclass Student(model.Model):\n    username = model.StringField(max_length=120, unique=True)\n    person_name = model.StringField(max_length=120)\n\n# Full row: get() returns the one matching model instance, or None.\nstudent = Student.get(username="ada").get()\n\n# Project only person_name; this is a query projection.\nname = Student.get.unique("person_name").get(username="ada")`,
        note: "For an explicitly named SQL constraint, use model.UniqueConstraint in __table_args__ and omit unique=True on that field. Explicit names are optional.",
      },
      {
        title: "Name database constraints",
        body: "Constraint names are optional in model declarations. LenAPI generates stable names for unique and foreign-key constraints, so ordinary unique=True and ForeignKeyField declarations work without a name, including during SQLite batch migrations. Set __table_args__ or ForeignKeyField.constraint_name only when you need to choose the exact database name; omit unique=True on a field when declaring its explicit UniqueConstraint.",
        code: `class Student(model.Model):
    # No explicit constraint name is needed here.
    phone = model.PhoneField(max_length=32, nullable=False, unique=True)

# To choose the exact unique-constraint name instead:
class StudentWithNamedPhone(model.Model):
    phone = model.PhoneField(max_length=32, nullable=False)
    __table_args__ = (
        model.UniqueConstraint("phone", name="uq_student_phone"),
    )

class Enrollment(model.Model):
    student_id = model.ForeignKeyField(
        "student.id",
        # Optional: set this only when you want an exact foreign-key name.
        constraint_name="fk_enrollment_student_id_student",
    )`,
      },
      {
        title: "Set delete behavior on foreign keys",
        body: "Choose one policy for related records: cascade deletes children, null keeps children with a NULL foreign key, and protected blocks deletion while a child refers to the row.",
        code: `class Verification(model.Model):\n    user_id = model.ForeignKeyField("user.id", model=model.cascade.delete)\n\nclass AuditLog(model.Model):\n    user_id = model.ForeignKeyField(\n        "user.id", nullable=True, model=model.null\n    )\n\nclass Invoice(model.Model):\n    user_id = model.ForeignKeyField("user.id", model=model.protected)`,
      },
      {
        title: "Connect many-to-many models",
        body: "ManyToManyField creates an association table included in Alembic migrations. Add related instances, save the owner, and query the collection.",
        code: `class Course(model.Model):\n    name = model.StringField(max_length=120)\n\nclass Teacher(model.Model):\n    name = model.StringField(max_length=120)\n    courses = model.ManyToManyField("Course")\n\nteacher = Teacher.get_or_404(id=1)\nteacher.courses.add(Course.get_or_404(id=1))\nteacher.save()`,
      },
    ],
  },
  {
    id: "migrations",
    group: "Data layer",
    title: "Migrations and database setup",
    eyebrow: "GUIDE 07 · SCHEMA CHANGES",
    summary: "Choose one database backend, detect model changes, and safely apply migration revisions.",
    readTime: "6 min",
    tags: ["database", "migrate", "migration", "sqlite", "mysql", "postgresql", "mongodb"],
    steps: [
      {
        title: "Choose one database and set its URL",
        body: "DATABASE_TYPE selects one active backend and DATABASE_URL connects to it for model operations and migrations. Leave the default SQLite setup for local development; choose MySQL, PostgreSQL, or MongoDB by changing both settings. Do not put a second database URL in a separate async setting: ACTIVATE_ASYNC enables async access to the same configured database. Keep real production credentials private and URL-encode reserved characters in passwords.",
        code: `# settings.py — choose ONE pair\n# SQLite (default; relative path)\nDATABASE_TYPE = "sqlite"\nDATABASE_URL = "sqlite:///lenapi.db"\n\n# MySQL (install: python -m pip install 'lenapi[mysql]')\n# DATABASE_TYPE = "mysql"\n# DATABASE_URL = "mysql://user:password@localhost:3306/app_db"\n\n# PostgreSQL (install: python -m pip install 'lenapi[postgres]')\n# DATABASE_TYPE = "postgresql"\n# DATABASE_URL = "postgresql://user:password@localhost:5432/app_db"\n\n# MongoDB (install: python -m pip install 'lenapi[mongodb]')\n# DATABASE_TYPE = "mongodb"\n# DATABASE_URL = "mongodb://user:password@localhost:27017/app_db"\n\nACTIVATE_ASYNC = False`,
        note: "When async access is enabled, SQLite uses aiosqlite; MySQL and PostgreSQL also need the async driver extras: lenapi[async-mysql] or lenapi[async-postgres]. MongoDB uses its separate sync/async document API. Relational driver URLs may omit an explicit driver; LenAPI selects its supported driver for the chosen backend.",
      },
      {
        title: "Declare models in the app",
        body: "Put app models in app/models.py and import them from main.py so migration discovery loads them before Alembic compares metadata.",
        code: `# app/models.py\nfrom lenapi import model\n\nclass Student(model.Model):\n    person_name = model.StringField(max_length=120, unique=True)\n    course = model.StringField(max_length=120)`,
      },
      {
        title: "Know when to use migration or migrate",
        body: "migration compares imported model metadata with the database, creates a new Alembic revision when there is a schema change, then applies pending revisions. If there is no model change, it skips the upgrade. migrate never generates a revision: it applies only migration files already present locally. Use migration during development after changing models; commit the generated revision, then use migrate in deployment/release steps to apply the reviewed revision.",
        code: `# Development: detect model changes, generate a revision, and apply it\npython lenora.py migration\n\n# Deployment: apply checked-in pending revisions only\npython lenora.py migrate`,
        note: "Import app model modules before running either command so Alembic compares the complete application metadata. Optional revision label: python lenora.py migration --message 'add student phone'.",
      },
      {
        title: "Inspect migration history",
        body: "showmigrations lists local revision files, marks which revisions are applied, and reports missing revision files referenced by the database or by another revision. Use it before repair and when a migration target is not up to date. With MongoDB it explains that Alembic revisions do not apply.",
        code: `python lenora.py showmigrations`,
      },
      {
        title: "Repair a missing revision reference",
        body: "repair-migrations is for broken or missing Alembic history, not for applying model changes. It compares the live SQL schema with current model metadata and only stamps migration history when they match; it preserves tables and data. If schemas differ, it refuses. Restore the missing revision file or reconcile the live schema first. MongoDB does not support this command.",
        code: `python lenora.py showmigrations\npython lenora.py repair-migrations\npython lenora.py showmigrations`,
        note: "For an empty database with no revisions, use migration to create the initial revision instead. Do not use repair as a shortcut to ignore unapplied schema changes.",
      },
      {
        title: "Reset migration state only when intended",
        body: "clear_migrations removes local revision files and Alembic version state only when no application tables exist. delete_migrations is a confirmed destructive reset: it drops all tables and views in the configured SQL database, or all collections in MongoDB, and deletes local revision files. It removes application data too; back up first and use it only when you intend to start from a completely clean database.",
        code: `# Limited to an empty SQL database\npython lenora.py clear_migrations\n\n# Full destructive reset; prompts for y/n confirmation\npython lenora.py delete_migrations\n\n# Then create and apply a fresh initial revision\npython lenora.py migration`,
        note: "MongoDB has no Alembic history: showmigrations reports that fact, migration/migrate initialize missing collections, repair-migrations and clear_migrations are SQL-only, and delete_migrations drops all collections after confirmation.",
      },
      {
        title: "Install a backend driver",
        body: "SQLite ships with the default package. MySQL and PostgreSQL use SQLAlchemy relational models and Alembic migrations. MongoDB uses the separate MongoDocument API; migration initializes collections but does not generate revisions for document field changes.",
        code: `python -m pip install 'lenapi[mysql]'\npython -m pip install 'lenapi[postgres]'\npython -m pip install 'lenapi[mongodb]'\n\n# Optional async drivers\npython -m pip install 'lenapi[async-mysql]'\npython -m pip install 'lenapi[async-postgres]'`,
      },
    ],
  },
  {
    id: "queries",
    group: "Data layer",
    title: "CRUD, search, and pagination",
    eyebrow: "GUIDE 08 · MODEL QUERIES",
    summary: "Create records, perform unique lookups, filter and search collections, aggregate values, and paginate results.",
    readTime: "8 min",
    tags: ["crud", "get", "filter", "search", "count", "aggregate", "pagination", "save", "delete"],
    steps: [
      {
        title: "Create and save a record",
        body: "Use Model.create(...) for synchronous code; it inserts, commits, refreshes, and returns the model instance. For async routes, await Model.acreate(...). You can also instantiate directly, then call save() or await asave() after changing fields.",
        code: `# Sync\nstudent = Student.create(person_name="Ada", course="Python")\nstudent.course = "Databases"\nstudent.save()\n\n# Async\nstudent = await Student.acreate(person_name="Ada", course="Python")\nstudent.course = "Databases"\nawait student.asave()`,
      },
      {
        title: "Get all rows or one row",
        body: "For a synchronous list use Model.get.all(); the matching async manager call is await Model.aget.all(). For a filtered async list use await Model.afilter(...).all(). To fetch one row, use Model.get(id=...).get() or await Model.aget(id=...). Single-row lookups return None when no row matches; use the sync *_or_404 helper or raise HTTPException in an async route.",
        code: `# All rows: full model instances\nstudents = Student.get.all()\nasync_students = await Student.aget.all()\n\n# One row by id\nstudent = Student.get(id=1).get()\nasync_student = await Student.aget(id=1)\n\n# Check whether a row exists\nexists = Student.get(id=1).exists()\nasync_exists = await Student.aget(id=1).exists()`,
      },
      {
        title: "Fetch related rows through foreign keys and ManyToMany",
        body: "Assuming Student.classroom_id is a ForeignKeyField and Teacher.courses is a ManyToManyField, sync code can resolve the foreign key with .special('classroom_id') and read a collection with teacher.courses.all(). In async code, fetch the foreign-key target with a second awaited lookup. For async ManyToMany, eager-load the collection with SQLAlchemy selectinload and an injected AsyncSession before accessing it; direct lazy relationship access cannot perform async I/O safely.",
        code: `# Sync foreign key: special() resolves classroom_id to a Classroom object.\nstudent = Student.get(id=1).special("classroom_id")\nclassroom = student.classroom_id  # Classroom instance, or None\nclassroom_name = classroom.name if classroom else None\n\n# Async foreign key: follow the stored id with an async lookup.\nstudent = await Student.aget(id=1)\nclassroom = None\nif student is not None and student.classroom_id is not None:\n    classroom = await Classroom.aget(id=student.classroom_id)\n\n# Sync ManyToMany collection\nteacher = Teacher.get(id=1).get()\ncourses = teacher.courses.all()\n\n# Async ManyToMany: eager-load before reading the collection.\nfrom sqlalchemy import select\nfrom sqlalchemy.ext.asyncio import AsyncSession\nfrom sqlalchemy.orm import selectinload\n\n@app.get("/teachers/{teacher_id}/courses")\nasync def teacher_courses(teacher_id: int, db: AsyncSession):\n    result = await db.scalars(\n        select(Teacher)\n        .options(selectinload(Teacher.courses))\n        .where(Teacher.id == teacher_id)\n    )\n    teacher = result.one_or_none()\n    if teacher is None:\n        return []\n    return [{"id": course.id, "name": course.name}\n            for course in teacher.courses.all()]`,
        note: "Declare both relationships in app/models.py and run python lenora.py migration. The async example requires ACTIVATE_ASYNC = True and an installed async database driver.",
      },
      {
        title: "Select only the columns you need",
        body: "Pass column names to Model.get(...), then give lookup filters to .get(...). One selected column returns a scalar; multiple selected columns return a mapping. For async access, select with afilter().values(...) and await .get(...). This only projects query results; it does not change the model or database schema.",
        code: `# Sync: one column returns a scalar\nname = Student.get("person_name").get(id=1)\n\n# Sync: multiple columns return a mapping\nsummary = Student.get("person_name", "course").get(id=1)\n\n# Async projection\nasync_summary = await Student.afilter().values(\n    "person_name", "course"\n).get(id=1)`,
      },
      {
        title: "Filter, search, and order",
        body: "filter(**conditions) builds a query and all() executes it. Supported suffixes are exact, iexact, ne, gt, gte, lt, lte, in, notin, contains, icontains, startswith, istartswith, endswith, iendswith, and isnull. Chain values(), order(), limit(), and offset() before execution. Use afilter() and await the terminal operation in async code. search(...) matches every supplied search term; search_any(query, *fields) matches the term in any listed string field.",
        code: `# Sync: exact and lookup filters, projection and descending order\nstudents = Student.filter(\n    course__icontains="py",\n    id__gte=1,\n).values("person_name", "course").order("-id").all()\n\n# Async equivalent\nasync_students = await Student.afilter(\n    course__icontains="py",\n    id__gte=1,\n).values("person_name", "course").order("-id").all()\n\n# Search all terms, or search one term across fields (OR)\nmatched = Student.search(person_name="ada", course="python").all()\nany_field = Student.search_any("python", "person_name", "course").all()\nasync_matched = await Student.asearch(person_name="ada").all()\nasync_any = await Student.asearch_any(\n    "python", "person_name", "course"\n).all()`,
      },
      {
        title: "Paginate and return metadata",
        body: "Pass non-negative limit and offset values to all(), or chain limit() and offset() first. The returned list-like result also exposes total_count, page_count, total_pages, and pagination metadata. These examples declare StudentOutput and a page response schema, then use response_model so Swagger documents the same response shape for sync and async routes.",
        code: `from typing import Any\nfrom pydantic import BaseModel, ConfigDict\nfrom lenapi import LENAPI\nfrom app.models import Student\n\napp = LENAPI()\n\nclass StudentOutput(BaseModel):\n    model_config = ConfigDict(from_attributes=True)\n    id: int\n    person_name: str | None\n    course: str | None\n\nclass StudentPageOutput(BaseModel):\n    results: list[StudentOutput]\n    pagination: dict[str, Any] | None\n\n# Sync route\n@app.get("/students", response_model=StudentPageOutput)\ndef list_students(limit: int = 20, offset: int = 0):\n    page = Student.filter(course="Python").all(limit=limit, offset=offset)\n    return {\n        "results": [StudentOutput.model_validate(row).model_dump(mode="json")\n                    for row in page],\n        "pagination": page.pagination,\n    }\n\n# Async route\n@app.get("/async/students", response_model=StudentPageOutput)\nasync def list_students_async(limit: int = 20, offset: int = 0):\n    page = await Student.afilter(course="Python").all(\n        limit=limit, offset=offset\n    )\n    return {\n        "results": [StudentOutput.model_validate(row).model_dump(mode="json")\n                    for row in page],\n        "pagination": page.pagination,\n    }`,
      },
      {
        title: "Aggregate data",
        body: "Model.count() counts every row; Model.filter(...).count() counts matching rows. Model.aggregate() and filtered-query aggregate() run Count, Sum, Min, Max, or Avg in the database. Name each aggregate result with a keyword. Pass group_by to return one result dictionary per group. Decimal sums and averages return Decimal values.",
        code: `from lenapi import model\n\nclass Purchase(model.Model):\n    user_id = model.IntegerField(nullable=False)\n    amount = model.DecimalField(max_digits=12, decimal_places=2)\n    status = model.StringField(max_length=20)\n\n# Row counts\ntotal_purchases = Purchase.count()\npaid_count = Purchase.filter(status="paid").count()\n\n# One aggregate dictionary for all matching rows\nspend = Purchase.filter(status="paid").aggregate(\n    total=model.Sum("amount"),\n    lowest=model.Min("amount"),\n    highest=model.Max("amount"),\n    average=model.Avg("amount"),\n    purchases=model.Count(),\n)\n\n# One dictionary per user\nby_user = Purchase.filter(status="paid").aggregate(\n    group_by="user_id",\n    total=model.Sum("amount"),\n    purchases=model.Count(),\n)`,
      },
      {
        title: "Delete with intent",
        body: "Delete a unique record with a get query or delete a filtered set. Model.all().delete() drops a whole table, so use it only when that destructive behavior is explicitly intended.",
        code: `Student.get(person_name="Ada").delete()\nStudent.filter(course="Old Course").delete()`,
      },
    ],
  },
  {
    id: "async",
    group: "Data layer",
    title: "Async endpoints and database access",
    eyebrow: "GUIDE 09 · ASYNC PYTHON",
    summary: "Use async handlers and SQLAlchemy AsyncSession with the same configured database URL.",
    readTime: "6 min",
    tags: ["async", "await", "database", "AsyncSession", "acreate", "aget", "asave"],
    steps: [
      {
        title: "Enable async access in settings",
        body: "ACTIVATE_ASYNC enables async database resources alongside the selected DATABASE_URL. Async SQLite is available by default; production drivers can be installed from their optional extras.",
        code: `# settings.py\nDATABASE_TYPE = "sqlite"\nDATABASE_URL = "sqlite:///lenapi.db"\nACTIVATE_ASYNC = True`,
      },
      {
        title: "Use AsyncSession in a route",
        body: "Annotate a handler parameter with SQLAlchemy AsyncSession. LenAPI opens and closes the request-scoped session for you.",
        code: `from sqlalchemy import select\nfrom sqlalchemy.ext.asyncio import AsyncSession\n\n@app.get("/students")\nasync def list_students(db: AsyncSession):\n    result = await db.scalars(select(Student))\n    return result.all()`,
      },
      {
        title: "Use async model helpers",
        body: "The asynchronous ORM helpers are prefixed with a: acreate, aget, afilter, asave, adelete, aaggregate, and acount. Await each database operation.",
        code: `student = await Student.acreate(person_name="Ada", course="Python")\nstudent = await Student.aget(id=student.id)\nstudent.course = "Databases"\nawait student.asave()\n\npage = await Student.afilter(course="Databases").all(limit=20)`,
      },
      {
        title: "Install the matching async driver",
        body: "Keep sync and async access on the same configured database backend; choose the required driver extra for MySQL or PostgreSQL.",
        code: `python -m pip install 'lenapi[mysql,async-mysql]'\n# PostgreSQL\npython -m pip install 'lenapi[postgres,async-postgres]'`,
        note: "An async route does not make blocking third-party I/O asynchronous. Use an async client or explicitly offload blocking work.",
      },
    ],
  },
  {
    id: "authentication",
    group: "Security",
    title: "Authentication patterns",
    eyebrow: "GUIDE 10 · AUTHENTICATION",
    summary: "Choose JWT, API-key, or Basic authentication, then protect the whole app, a router, or an individual endpoint.",
    readTime: "11 min",
    tags: ["jwt", "api key", "basic", "session", "bearer", "hmac", "oidc", "security"],
    steps: [
      {
        title: "Select the default authenticator in settings.py",
        body: "Choose one primary mode for app.authenticator. For quick development, LenAPI uses its built-in User model and its api_key column. You can instead pass your own user_model to authentication(); for custom API-key auth, explicitly provide api_key_field naming the model column that stores the key digest. Authentication does not automatically protect routes or generate login and registration endpoints.",
        code: `# settings.py\nAUTHENTICATION = "jwt"  # jwt, api_key, basic_login, opaque_bearer, or session\n\n# JWT settings are generated with a unique SECRET_KEY.\nTOKEN = {\n    "SECRET_KEY": SECRET_KEY,\n    "LIFETIME_SECONDS": 3600,\n    "REFRESH_LIFETIME_SECONDS": 2592000,\n    "ISSUER": API_TITLE,\n}\n\n# Used only by basic_login. This can be username, email, phone, etc.\nBASIC_AUTH_FIELD = "username"`,
      },
      {
        title: "Protect the whole app, a router, or one route",
        body: "Pass auth= to LENAPI to require it on all application routes. Router(auth=...) scopes protection to one group, while a route decorator's auth= protects one endpoint. Use Router scope when public registration or token routes share the same app; app-wide auth will also guard those routes.",
        code: `from lenapi import Depends, LENAPI, Router, authentication\n\n# App-wide: every route registered on this app requires JWT.\nauth = authentication("jwt")\napp = LENAPI(auth=auth)\n\n@app.get("/account")\ndef account(identity=Depends(auth)):\n    return {"identity": identity}\n\n# Or scope to a router using settings.py's selected authenticator:\napp = LENAPI()\napi_auth = app.authenticator\napi = Router(prefix="/api", auth=api_auth)\n\n@api.get("/profile")\ndef profile(identity=Depends(api_auth)):\n    return {"user_id": identity["sub"]}\n\n@api.get("/admin", auth=api_auth)\ndef admin(identity=Depends(api_auth)):\n    return {"identity": identity}\n\napp.include_router(api)`,
        note: "settings.AUTHENTICATION selects app.authenticator; it does not make auth global by itself. Attach the authenticator with auth= where you want it enforced. For email or phone login, the field must exist on the user model and your registration flow must populate it.",
      },
      {
        title: "Use your own user model",
        body: "JWT and Basic authentication can use a developer model by passing user_model. For Basic login, set BASIC_AUTH_FIELD in settings.py to a column on that model; the password column is named password and must contain a LenAPI-compatible one-way hash. The framework default User remains available for quick setup.",
        code: `from lenapi import authentication\nfrom app.models import Customer\n\n# settings.py: BASIC_AUTH_FIELD = "email"\nbasic_auth = authentication("basic_login", user_model=Customer)\njwt_auth = authentication("jwt", user_model=Customer)`,
      },
      {
        title: "Use JWT and mount token endpoints",
        body: "The default JWT authenticator checks usernames and password hashes against the framework User model. Mount its router to provide POST /auth/token and POST /auth/refresh, then attach the same authenticator to private routes. The token and refresh operations are intentionally hidden from Swagger; protected operations still show Bearer authentication.",
        code: `from lenapi import Depends, LENAPI, Router\nfrom lenapi.authentication import UserRegistration, register_user\n\napp = LENAPI()  # settings.AUTHENTICATION = "jwt"\njwt = app.authenticator\napp.include_router(jwt.router())  # POST /auth/token and /auth/refresh\n\npublic = Router(prefix="/auth")\n@public.post("/register")\ndef register(data: UserRegistration):\n    return register_user(data=data, authentication="jwt")\n\nprivate = Router(prefix="/api", auth=jwt)\n@private.get("/profile")\ndef profile(identity=Depends(jwt)):\n    return {"user_id": identity["sub"]}\n\napp.include_router(public)\napp.include_router(private)`,
        note: "POST /auth/token accepts username and password and returns access_token plus refresh_token. Send the access token as Authorization: Bearer <access_token>. A refresh token is single-use; use shared database or Redis security storage when running multiple workers.",
      },
      {
        title: "Enable API-key authentication from the CLI",
        body: "Run the CLI to select API-key authentication, add the optional APIKey management model, and run migrations. At request time, the built-in authenticator uses the framework User model: it hashes the presented key and compares that digest with User.api_key. The generated APIKey table is a separate app-managed key registry linked to User; the built-in authenticator and register_user() do not read or populate it automatically.",
        code: `# From the generated project directory\npython lenora.py apikey\n\n# The CLI adds this model to app/models.py and runs migration:\nfrom datetime import datetime\nfrom lenapi import model\n\nclass APIKey(model.Model):\n    user_id = model.ForeignKeyField("user.id", model=model.CASCADE, nullable=False)\n    key_hash = model.StringField(max_length=64, unique=True, nullable=False)\n    is_active = model.BooleanField(default=True, nullable=False)\n    created_at = model.DateTimeField(default=datetime.utcnow, nullable=False)\n    revoked_at = model.DateTimeField(nullable=True)`,
        note: "The framework User row stores the active key digest in its api_key column. APIKey.user_id links optional management records to that User. If you want authentication to check a custom model or the APIKey table, configure your own lookup/dependency; never store a raw key in key_hash.",
      },
      {
        title: "Use a custom model and API-key column",
        body: "For quick development, omit user_model and use the framework User.api_key field. For your own model, provide both user_model and api_key_field; there is deliberately no implicit field-name fallback. The selected column must exist and stores only the SHA-256 digest. LenAPI validates it during setup and raises a clear error if it is missing.",
        code: `from lenapi import authentication, hash_api_key, make_api_key, model\n\nclass Customer(model.Model):\n    username = model.StringField(max_length=120, unique=True)\n    password = model.StringField(max_length=255)\n    key_digest = model.StringField(max_length=64, unique=True, nullable=True)\n\nauth = authentication(\n    "api_key",\n    user_model=Customer,\n    api_key_field="key_digest",\n)\n\n# In a trusted provisioning flow, show raw_key once and store only its digest.\nraw_key = make_api_key()\ncustomer = Customer.get(id=1).get()\ncustomer.key_digest = hash_api_key(raw_key)\ncustomer.save()`,
        note: "If you use register_user() with a custom model, also pass api_key_field='key_digest'. The custom model must expose the fields required by your registration flow.",
      },
      {
        title: "Return the API key once and send it on requests",
        body: "register_user creates a cryptographically random URL-safe key when authentication='api_key'. It stores only the SHA-256 digest on User.api_key and includes the raw key once in the response. Keep the raw value for the caller; it cannot be recovered later.",
        code: `from lenapi import LENAPI, Router\nfrom lenapi.authentication import UserRegistration, register_user\n\napp = LENAPI()\npublic = Router(prefix="/auth")\n\n@public.post("/register")\ndef register(data: UserRegistration):\n    return register_user(data=data, authentication="api_key")\n\napp.include_router(public)\n\n# A successful response includes: {"api_key": "<show once to the user>"}\n# Later requests send: X-API-Key: <api_key>`,
      },
      {
        title: "Use database-backed Basic authentication",
        body: "Set basic_login and optionally choose the identifier column. Passwords must be stored as one-way hashes; register_user handles hashing. The client sends the identifier and password in the HTTP Basic Authorization header on every request, so use HTTPS.",
        code: `# settings.py\nAUTHENTICATION = "basic_login"\nBASIC_AUTH_FIELD = "email"  # This column exists on the framework User model.\n\n# main.py\nfrom pydantic import Field\nfrom lenapi import Depends, LENAPI, Router\nfrom lenapi.authentication import UserRegistration, register_user\n\nclass EmailRegistration(UserRegistration):\n    email: str = Field(min_length=3, max_length=254)\n\napp = LENAPI()\nbasic = app.authenticator\npublic = Router(prefix="/auth")\nprivate = Router(prefix="/api", auth=basic)\n\n@public.post("/register")\ndef register(data: EmailRegistration):\n    return register_user(data=data, authentication="basic_login")\n\n@private.get("/profile")\ndef profile(identity=Depends(basic)):\n    return {"user_id": identity}\n\napp.include_router(public)\napp.include_router(private)\n\n# Client example:\n# requests.get(url, auth=("ada@example.com", "password"))`,
      },
      {
        title: "Use server-side sessions",
        body: "A session dependency reads a cookie and resolves the session identity from app.security_store. Create the session only after your login route verifies credentials. Store the identity server-side and send only a random, HttpOnly session ID to the browser.",
        code: `import json\nimport secrets\nfrom lenapi import Depends, JSONResponse, LENAPI, Request\nfrom lenapi.security import session_auth\n\napp = LENAPI()  # SECURITY_STORAGE defaults to database\nsession = session_auth(store=app.security_store, cookie_name="session_id")\n\n@app.post("/session/login")\nasync def login():\n    # Replace with real credential verification first.\n    identity = {"user_id": "123"}\n    session_id = secrets.token_urlsafe(32)\n    await app.security_store.set(\n        f"session:{session_id}", json.dumps(identity), ttl=3600\n    )\n    response = JSONResponse({"authenticated": True})\n    response.set_cookie(\n        "session_id", session_id, max_age=3600, path="/",\n        httponly=True, secure=True, samesite="lax",\n    )\n    return response\n\n@app.get("/session/me")\ndef session_me(identity=Depends(session)):\n    print(identity)\n    return identity\n\n@app.post("/session/logout")\nasync def logout(request: Request, identity=Depends(session)):\n    session_id = request.cookies.get("session_id")\n    print(session_id)\n    await app.security_store.delete(f"session:{session_id}")\n\n    response = JSONResponse({"message": "Logged out"})\n    response.delete_cookie("session_id")\n    return response`,
        note: "For local plain-HTTP development, set secure=False; use secure=True behind HTTPS in production. Logout requires a valid session, deletes its server-side record, and expires the browser cookie. Add CSRF protection to state-changing cookie-authenticated routes.",
      },
      {
        title: "Use opaque bearer tokens",
        body: "Opaque tokens are random values checked against the shared security store on every request. They are not self-contained JWTs, so deleting the store entry revokes the token immediately.",
        code: `import json\nimport secrets\nfrom lenapi import Depends, JSONResponse, LENAPI, Request\nfrom lenapi.security import opaque_bearer_auth\n\napp = LENAPI()\nbearer = opaque_bearer_auth(store=app.security_store)\n\nasync def issue_token(identity: dict) -> str:\n    token = secrets.token_urlsafe(32)\n    await app.security_store.set(\n        f"opaque_bearer:{token}", json.dumps(identity), ttl=3600\n    )\n    return token\n\nasync def revoke_token(token: str) -> bool:\n    await app.security_store.delete(f"opaque_bearer:{token}")\n    return True\n\n@app.post("/opaque/token")\nasync def token(request: Request):\n    # Verify credentials before issuing a token in a real app.\n    value = await issue_token({"user_id": 1, "name": "Tolu"})\n    return JSONResponse({"token": value})\n\n@app.get("/opaque/profile", auth=bearer)\ndef profile(request: Request, identity=Depends(bearer)):\n    # Do not log the raw bearer token in production.\n    return identity\n\n@app.post("/opaque/revoke", auth=bearer)\nasync def revoke(request: Request, identity=Depends(bearer)):\n    token = request.headers["authorization"].removeprefix("Bearer").strip()\n    await revoke_token(token)\n    return {"message": "Token revoked"}`,
        note: "The sample token route uses a fixed identity to demonstrate storage; verify credentials before issuing tokens. The strip() after removeprefix('Bearer') is needed so revocation looks up the same token value that was stored. Return tokens only once, never log them, and use HTTPS. Database storage is the generated default; Redis is also available.",
      },
      {
        title: "When to use HMAC",
        body: "Use HMAC for trusted service-to-service requests and webhooks when both sides can share a secret. The sender signs each request; the receiver recomputes the signature. HMAC is not a login flow and does not issue bearer tokens. The signature covers the timestamp, uppercase method, path and query, SHA-256 digest of the exact body bytes, and a unique nonce.",
        list: [
          "Use it when another service posts webhooks to your LenAPI endpoint.",
          "Use the same signing format when a LenAPI app calls a partner that accepts HMAC-signed requests.",
          "Provision a shared secret of at least 32 bytes to both parties using a secure channel.",
        ],
      },
      {
        title: "Verify a partner webhook in LenAPI",
        body: "Configure hmac_auth with the shared secret. header_name is the partner-specific signature header; timestamp and nonce remain X-LenAPI-Timestamp and X-LenAPI-Nonce. Pass app.security_store as nonce_store to reject replayed requests across workers. The dependency verifies raw bytes before the route parses arbitrary JSON.",
        code: `# settings.py: PARTNER_HMAC_SECRET = a securely configured 32+ byte secret\nfrom typing import Any\nfrom lenapi import Depends, LENAPI, Request\nfrom lenapi.security import hmac_auth\nfrom settings import PARTNER_HMAC_SECRET\n\napp = LENAPI()\npartner_auth = hmac_auth(\n    PARTNER_HMAC_SECRET,\n    tolerance_seconds=300,\n    nonce_store=app.security_store,\n    header_name="X-Flutterwave",\n)\n\n@app.post("/partner/webhook", auth=partner_auth)\nasync def receive_partner_webhook(\n    request: Request,\n    identity=Depends(partner_auth),\n):\n    body: Any = await request.json()  # accepts variable JSON payloads\n    # Validate event type and fields before performing business actions.\n    return {"accepted": True, "body": body}`,
        note: "In production, use HTTPS, protect the shared secret, validate the webhook event before acting on it, and configure database or Redis security storage for multi-worker replay protection. Without nonce_store, replay tracking is process-local.",
      },
      {
        title: "Send a signed webhook without installing LenAPI",
        body: "A partner client only needs Python's standard library and requests. Serialize the JSON once, sign those exact bytes, and send the same bytes unchanged. The signature header must be the same name configured in hmac_auth.",
        code: `import hashlib\nimport hmac\nimport json\nimport secrets\nimport time\nimport requests\n\nclient_secret = "same-secret-configured-on-the-LenAPI-server"\nurl = "https://api.example.com/partner/webhook"\nmethod = "POST"\npath = "/partner/webhook"\npayload = {"event": "payment.completed", "reference": "order-123"}\nbody = json.dumps(payload, separators=(",", ":")).encode("utf-8")\ntimestamp = str(int(time.time()))\nnonce = secrets.token_urlsafe(16)\nbody_digest = hashlib.sha256(body).hexdigest()\nmessage = f"{timestamp}\\n{method}\\n{path}\\n{body_digest}\\n{nonce}".encode("utf-8")\nsignature = hmac.new(\n    client_secret.encode("utf-8"), message, hashlib.sha256\n).hexdigest()\n\nresponse = requests.post(\n    url,\n    data=body,\n    headers={\n        "Content-Type": "application/json",\n        "X-LenAPI-Timestamp": timestamp,\n        "X-LenAPI-Nonce": nonce,\n        "X-Flutterwave": signature,\n    },\n    timeout=15,\n)\nprint(response.status_code, response.text)`,
        note: "The signed message is timestamp, uppercase method, path plus query string, lowercase-hex SHA-256 body digest, and nonce, joined by newline characters. A stale timestamp, reused nonce, mismatched custom header, or body/path changed after signing causes verification to fail.",
      },
      {
        title: "Sign an outgoing request from a LenAPI app",
        body: "LenAPI can also be the HMAC client. Generate the secret once and share it securely with the receiving service; HMAC does not issue a new token per request. Use hmac_request_signature for the same signing format, then send the body and signature headers.",
        code: `import json\nimport secrets\nimport time\nimport requests\nfrom lenapi.security import hmac_request_signature\n\nshared_secret = "same-secret-provisioned-to-the-receiver"\nurl = "https://partner.example.com/events"\nmethod = "POST"\npath = "/events"\npayload = {"event": "account.updated", "account_id": "acct-42"}\nbody = json.dumps(payload, separators=(",", ":")).encode("utf-8")\ntimestamp = str(int(time.time()))\nnonce = secrets.token_urlsafe(16)\nsignature = hmac_request_signature(\n    shared_secret, method, path, timestamp, body, nonce=nonce\n)\nresponse = requests.post(\n    url, data=body,\n    headers={\n        "Content-Type": "application/json",\n        "X-LenAPI-Timestamp": timestamp,\n        "X-LenAPI-Nonce": nonce,\n        "X-LenAPI-Signature": signature,\n    },\n    timeout=15,\n)\nprint(response.status_code, response.text)`,
      },
      {
        title: "Choose the OIDC integration",
        body: "OIDC is a protocol for identity built on OAuth 2.0. LenAPI offers two different integration points. SocialAuth runs supported browser login and callback routes; oidc_auth protects an API route using a token that the client already obtained elsewhere. Choose based on which side owns the sign-in flow.",
        list: [
          "Choose SocialAuth for LenAPI-managed Google, GitHub, or LinkedIn login routes, callback handling, optional local user registration, and an optional LenAPI JWT for later API calls.",
          "Choose oidc_auth when a frontend, mobile client, or external identity system already performs login and sends its provider token to your API.",
          "oidc_auth does not create login/callback routes, register users, or mint a new token. It validates and exposes identity claims for protected routes.",
        ],
        note: "In LenAPI's current SocialAuth integration, Google and LinkedIn use OIDC identity endpoints. GitHub uses OAuth 2.0 profile/email APIs and is not an OIDC provider in this integration.",
      },
      {
        title: "Validate an external OIDC token on a route",
        body: "Provide a callback that validates the token with a maintained OIDC/JWT library. It must verify the signature using trusted provider keys and validate issuer, audience, expiry, and nonce where required. Never accept claims by merely decoding the JWT.",
        code: `from lenapi import Depends, LENAPI\nfrom lenapi.security import oidc_auth\n\napp = LENAPI()\n\ndef verify_provider_token(token: str):\n    # Replace with a real, cryptographically verified library call.\n    claims = verify_with_provider_keys(\n        token, issuer="https://issuer.example", audience="your-client-id"\n    )\n    if claims is None:\n        return None\n    return {\n        "sub": claims["sub"],\n        "email": claims.get("email"),\n        "scope": claims.get("scope", ""),\n    }\n\nprovider_auth = oidc_auth(verify_provider_token)\n\n@app.get("/oidc/profile", auth=provider_auth)\ndef oidc_profile(identity=Depends(provider_auth)):\n    return identity`,
        note: "The client sends Authorization: Bearer <provider-token>. auth= enforces authentication, and Depends(provider_auth) injects verified claims. Add authorization checks for roles, scopes, and resource ownership in your application.",
      },
    ],
  },
  {
    id: "social",
    group: "Security",
    title: "Social sign-in with OAuth and OIDC",
    eyebrow: "GUIDE 11 · FEDERATED IDENTITY",
    summary: "Generate explicit login and callback routes for Google, GitHub, and LinkedIn.",
    readTime: "7 min",
    tags: ["oauth", "oidc", "google", "github", "linkedin", "social login", "callback"],
    steps: [
      {
        title: "Set provider credentials in settings",
        body: "For each enabled provider, set its client ID, client secret, and exact callback URL. Store secrets in environment variables or a local ignored environment file.",
        code: `GOOGLE_CLIENT_ID = ""\nGOOGLE_CLIENT_SECRET = ""\nGOOGLE_REDIRECT_URI = ""\n\nGITHUB_CLIENT_ID = ""\nGITHUB_CLIENT_SECRET = ""\nGITHUB_REDIRECT_URI = ""\n\nSOCIAL_AUTH_ALLOWED_ORIGINS = ["https://myapp.com"]  # Replace with your frontend origin`,
      },
      {
        title: "Create and mount the auth router",
        body: "SocialAuth generates provider login and callback routes only when its router is mounted. The browser starts at a provider login route, the provider authenticates the user, and redirects to the callback. The callback validates state (and PKCE where supported), exchanges the code, fetches the provider profile, and can register/find a local user. With jwt_enabled=True, LenAPI returns its own bearer token for API access; it does not return the provider access token. Use oidc_auth instead when another client already owns login and sends a provider token directly to a protected API route.",
        code: `from lenapi.security import SocialAuth\n\nauth = SocialAuth(\n    providers=["google", "github", "linkedin"],\n    auto_register=True,\n    jwt_enabled=True,\n)\n\napp.include_router(auth.router(), prefix="/auth")`,
      },
      {
        title: "Configure provider callback URLs",
        body: "Register each exact callback URL with the provider console. Google and LinkedIn use OIDC identity endpoints. GitHub uses OAuth 2.0 and its profile/email APIs; it is not an OIDC provider in this integration.",
        code: `# Example for local development\nGOOGLE_REDIRECT_URI = "http://localhost:8009/auth/google/callback"\nGITHUB_REDIRECT_URI = "http://localhost:8009/auth/github/callback"\nLINKEDIN_REDIRECT_URI = "http://localhost:8009/auth/linkedin/callback"`,
        note: "X and Facebook are currently disabled; listing either provider does not generate its routes. Microsoft is not currently supported.",
      },
      {
        title: "Run migrations before first sign-in",
        body: "Automatic registration stores provider subject mappings in a framework-managed table. Verified provider email can be copied to the local user; conflicting email ownership is rejected rather than silently linked.",
        code: `python lenora.py migration\npython lenora.py run`,
      },
    ],
  },
  {
    id: "security",
    group: "Security",
    title: "Middleware, throttling, and docs protection",
    eyebrow: "GUIDE 12 · SECURITY CONTROLS",
    summary: "Add security and observability middleware, rate limits, IP cooldowns, CSRF checks, and private Swagger docs.",
    readTime: "9 min",
    tags: ["middleware", "gzip", "throttle", "rate limit", "ip", "csrf", "docs", "cors"],
    steps: [
      {
        title: "Add optional middleware",
        body: "Middleware is opt-in. Common built-ins cover CORS, gzip compression, request IDs, timing headers, and docs authentication.",
        code: `from lenapi.middleware import (\n    CORSMiddleware, GZipMiddleware, RequestIDMiddleware, TimingMiddleware,\n)\n\napp.add_middleware(RequestIDMiddleware)\napp.add_middleware(TimingMiddleware)\napp.add_middleware(GZipMiddleware, minimum_size=500)\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=["https://frontend.example"],\n    allow_methods=["GET", "POST", "PATCH", "DELETE"],\n    allow_headers=["authorization", "content-type"],\n)`,
      },
      {
        title: "Configure rate limits",
        body: "Limits can count requests by IP before authentication, anonymous traffic, or an authenticated identity. Shared database or Redis storage coordinates counters across worker processes.",
        code: `app = LENAPI(throttle={\n    "ip": "300/minute",\n    "anonymous": "30/minute",\n    "authenticated": "600/minute",\n})\n\n@api.post("/login", throttle={"ip": "5/minute"})\ndef login(data: LoginInput):\n    ...`,
        note: "A BasicAuth route receives a default 10-per-minute IP limit unless a pre-auth limit is configured. An explicit throttle={} disables inherited limits. Process-memory counters do not coordinate across workers.",
      },
      {
        title: "Use a cooldown for sensitive endpoints",
        body: "api_flag enables a per-IP cooldown. The configured security backend stores the flag and returns 429 plus Retry-After while the cooldown is active.",
        code: `@app.post("/webhooks/receive", api_flag=True, cool_time=300)\ndef receive(payload: EventInput):\n    return {"received": True}`,
      },
      {
        title: "Protect cookie-authenticated writes against CSRF",
        body: "CSRFProtect issues a signed token cookie and checks the matching X-CSRF-Token header on state-changing requests. SameSite cookies are useful defense in depth, not a replacement for the token.",
        code: `from lenapi.security import CSRFProtect\n\ncsrf = CSRFProtect(settings.SECRET_KEY, secure=True, samesite="lax")\n\n@app.post("/account/email")\ndef change_email(user=Depends(app.authenticator), _csrf=Depends(csrf)):\n    return {"updated": True}`,
      },
      {
        title: "Make Swagger documentation private",
        body: "Set SAFE_GUARD_DOCS_URL to True to show an admin sign-in page at the base URL and protect Swagger/OpenAPI with database-backed admin sessions. Create an admin after the first migration.",
        code: `# settings.py\nSAFE_GUARD_DOCS_URL = True\n\n# First run\npython lenora.py migration\npython lenora.py admin`,
        note: "This protects documentation endpoints only. It does not automatically secure application API routes.",
      },
    ],
  },
  {
    id: "dependencies",
    group: "Security",
    title: "Dependencies and shared logic",
    eyebrow: "GUIDE 13 · DEPENDENCY INJECTION",
    summary: "Reuse route logic for authentication, database access, and request-scoped services.",
    readTime: "5 min",
    tags: ["Depends", "dependency", "auth", "session", "injection"],
    steps: [
      {
        title: "Create a dependency",
        body: "A dependency is a normal sync or async callable. Its typed inputs are resolved like endpoint parameters.",
        code: `from lenapi import Depends\n\ndef current_user(user_id: int):\n    return {"id": user_id, "name": "Ada"}\n\n@app.get("/profile/{user_id}")\ndef profile(user: dict = Depends(current_user)):\n    return user`,
      },
      {
        title: "Reuse an authenticator",
        body: "Use Depends for identity in a handler, or pass auth= to enforce authentication at route dispatch and include its security scheme in OpenAPI.",
        code: `from lenapi import Depends, LENAPI, Router, authentication\n\napp = LENAPI()\nauthenticate = authentication("jwt", app=app)\napi = Router(prefix="/api")\n\n@api.get("/profile", auth=authenticate)\ndef profile(user=Depends(authenticate)):\n    return {"user": user}\n\napp.include_router(api)`,
        note: "Dependencies are cached within one request. Sync dependencies run off the event loop so blocking callback code does not stall async routes.",
      },
    ],
  },
  {
    id: "websockets",
    group: "Realtime and services",
    title: "WebSockets: chat, video signaling, JSON, text, and bytes",
    eyebrow: "GUIDE 14 · REALTIME",
    summary: "Mount a ready-made WebSocket service or handle low-level ASGI WebSocket connections directly.",
    readTime: "8 min",
    tags: ["websocket", "chat", "video", "json", "text", "byte", "rooms", "webRTC"],
    steps: [
      {
        title: "Configure trusted browser origins",
        body: "Set WEBSOCKET_ALLOWED_ORIGINS in settings.py. Its generated default is an empty list, so browser connections are rejected until you add the exact frontend origin. Origin normalization and matching happen inside LenAPI; settings.py needs no parsing loop.",
        code: `# settings.py\nWEBSOCKET_ALLOWED_ORIGINS = ["https://app.example.com"]\nSOCIAL_AUTH_ALLOWED_ORIGINS = []`,
        note: "For local testing, use the exact origin of the page opening the socket, such as http://127.0.0.1:8009. Scheme, host, and port must match.",
      },
      {
        title: "Create and mount a chat service",
        body: "WebSocketService configures a path, message mode, optional authentication, maximum message size, heartbeat interval, and connection limits. When allowed_origins is omitted, the service reads WEBSOCKET_ALLOWED_ORIGINS from settings.py. Pass allowed_origins=[...] only when this service needs a different allowlist.",
        code: `from lenapi import LENAPI, WebSocketService\n\napp = LENAPI()\nchat = WebSocketService(\n    path="/ws/chat/{room_id}",\n    type="chat",\n    auth=authenticate,\n    max_message_size=64_000,\n    heartbeat_seconds=30,\n    max_connections=6,\n)\napp.include_router(chat.router())`,
      },
      {
        title: "Create a room and invite participants",
        body: "Room IDs can be generated by your HTTP endpoint. Participants join when they connect to a matching room path. Keep invite IDs private; the room service itself does not persist or authorize invitations unless you add authentication and policy checks.",
        code: `from uuid import uuid4\nfrom pydantic import BaseModel\n\nclass RoomInvite(BaseModel):\n    room_id: str\n    websocket_path: str\n\n@app.post("/rooms", response_model=RoomInvite)\ndef create_room():\n    room_id = uuid4().hex\n    return {\n        "room_id": room_id,\n        "websocket_path": f"/ws/chat/{room_id}",\n    }`,
      },
      {
        title: "Pick a message type",
        body: "Use chat for message dictionaries, video for WebRTC offer/answer/candidate signaling, json for arbitrary JSON on a fixed path, message for plain text, and byte for binary payloads.",
        code: `chat = WebSocketService(path="/ws/chat/{room_id}", type="chat")\nvideo = WebSocketService(path="/ws/video/{room_id}", type="video")\njson_feed = WebSocketService(path="/ws/json", type="json")\ntext_feed = WebSocketService(path="/ws/message", type="message")\nbytes_feed = WebSocketService(path="/ws/byte", type="byte")`,
      },
      {
        title: "Understand deployment boundaries",
        body: "Room membership and broadcast are held in process memory. A multi-worker deployment needs shared pub/sub if clients connected to different workers must communicate. The video mode relays signaling; media itself needs WebRTC client code and ICE/TURN infrastructure.",
        note: "Allowed origins are not authentication. Add auth for private rooms. Browser WebSocket APIs cannot set arbitrary Authorization headers, so use a secure cookie or custom authenticator.",
      },
      {
        title: "Use the low-level connection API when needed",
        body: "For custom protocol logic, register an app.websocket handler and use accept, receive_text, receive_json, receive_bytes, send, and close methods.",
        code: `from lenapi.service import WebSocket, WebSocketDisconnect\n\n@app.websocket("/ws/{room_id}")\nasync def socket(websocket: WebSocket, room_id: str):\n    await websocket.accept()\n    try:\n        while True:\n            message = await websocket.receive_json()\n            await websocket.send_json({"room_id": room_id, "echo": message})\n    except WebSocketDisconnect:\n        pass`,
      },
    ],
  },
  {
    id: "cache",
    group: "Realtime and services",
    title: "Cache data",
    eyebrow: "GUIDE 15 · CACHE",
    summary: "Store JSON-compatible values with expiration in process memory, the configured database, or Redis.",
    readTime: "4 min",
    tags: ["cache", "redis", "ttl", "database", "get", "set", "delete"],
    steps: [
      {
        title: "Choose a backend",
        body: "Set CACHE_BACKEND to memory, database, or redis. Memory is process-local and temporary; database and Redis are better when multiple workers need shared values.",
        code: `# settings.py\nCACHE_BACKEND = "database"  # memory, database, redis\nREDIS_URL = "redis://127.0.0.1:6379/0"`,
      },
      {
        title: "Set, read, and delete cache entries",
        body: "The current Cache service API is asynchronous. Values must be JSON serializable. TTL is specified in seconds.",
        code: `await app.cache.set("profile:42", {"name": "Ada"}, ttl=300)\nprofile = await app.cache.get("profile:42")\nawait app.cache.delete("profile:42")`,
      },
      {
        title: "Initialize persistent storage",
        body: "Database-backed cache uses the internal security-store table and is initialized by the migration command. Redis mode requires the redis extra and a reachable Redis server.",
        code: `python lenora.py migration\npython -m pip install 'lenapi[redis]'`,
      },
    ],
  },
  {
    id: "background",
    group: "Realtime and services",
    title: "Background tasks and durable queues",
    eyebrow: "GUIDE 16 · BACKGROUND WORK",
    summary: "Run small post-response tasks or persist jobs for a separate worker process.",
    readTime: "6 min",
    tags: ["background", "queue", "worker", "database", "redis", "task"],
    steps: [
      {
        title: "Use short-lived response tasks",
        body: "BackgroundTasks runs work after the response is sent. Sync callbacks are run in a worker thread; async callbacks are awaited. This is in-process and is not a durable queue.",
        code: `from lenapi import BackgroundTasks\n\ndef send_receipt(email: str):\n    ...\n\n@app.post("/orders")\ndef create_order(background_tasks: BackgroundTasks):\n    order = save_order()\n    background_tasks.add_task(send_receipt, order.email)\n    return {"id": order.id}`,
      },
      {
        title: "Persist jobs in a worker queue",
        body: "BackgroundQueue supports database, Redis, and process-cache backends. Database and Redis jobs are delivered at least once, so task handlers should be idempotent.",
        code: `from lenapi import BackgroundQueue\n\nqueue = BackgroundQueue(app.database)\n\n@queue.task("send_welcome")\nasync def send_welcome(email: str):\n    ...\n\njob_id = await queue.enqueue("send_welcome", "ada@example.com")`,
      },
      {
        title: "Run the worker separately",
        body: "Export the queue and register tasks in main.py. Start a separate worker process with the project CLI. The worker applies its queue migration before consuming jobs.",
        code: `python lenora.py background-worker`,
        note: "The cache/memory backend is ephemeral and cannot be shared between an API process and a separate worker process.",
      },
    ],
  },
  {
    id: "ai",
    group: "Realtime and services",
    title: "OpenAI, Ollama, and Faker services",
    eyebrow: "GUIDE 17 · INTEGRATIONS",
    summary: "Call OpenAI or local Ollama models asynchronously and generate deterministic fake data for development.",
    readTime: "6 min",
    tags: ["openai", "ollama", "faker", "ai", "fake data", "seed"],
    steps: [
      {
        title: "Install optional integration dependencies",
        body: "The AI wrappers use HTTPX and are asynchronous. Set OPENAI_API_KEY securely for OpenAI. Ollama must be running and have the selected model pulled.",
        code: `python -m pip install 'lenapi[ai]'\nexport OPENAI_API_KEY="..."\nollama pull llama3.2`,
      },
      {
        title: "Call OpenAI and Ollama",
        body: "Use async context managers to close connections reliably. Pass the Ollama base URL when it is hosted somewhere other than the local default.",
        code: `from lenapi import OpenAI, Ollama\n\nasync with OpenAI(model="gpt-4.1-mini") as openai:\n    answer = await openai.responses("Explain LenAPI in one sentence.")\n\nasync with Ollama(\n    model="llama3.2", base_url="http://127.0.0.1:11434"\n) as ollama:\n    answer = await ollama.chat([\n        {"role": "user", "content": "Explain LenAPI in one sentence."}\n    ])`,
      },
      {
        title: "Generate repeatable test data",
        body: "The Faker service delegates provider methods such as name, email, phone_number, and password. A seed makes an instance's generation sequence repeatable.",
        code: `from lenapi.service import Faker\n\nfake = Faker("en_NG", seed=42)\nname = fake.name()\nemail = fake.email()\nphone = fake.phone_number()\npassword = fake.password()`,
        note: "Faker is an optional integration. Install it with python -m pip install 'lenapi[faker]'.",
      },
    ],
  },
  {
    id: "testing",
    group: "Ship it",
    title: "Automated testing",
    eyebrow: "GUIDE 18 · QUALITY",
    summary: "Run the framework test suite or generate application endpoint checks and CSV reports.",
    readTime: "5 min",
    tags: ["pytest", "test", "testing", "csv", "api"],
    steps: [
      {
        title: "Run application checks",
        body: "Inside a generated application, the LenAPI CLI can inspect endpoints, generate tests, execute the suite, and write a CSV report under outputs/.",
        code: `python lenora.py test`,
      },
      {
        title: "Generate and run tests separately",
        body: "Use separate commands when you want to inspect the generated endpoint tests or execute them later. The CSV-output command writes endpoint and pytest results.",
        code: `python lenora.py generate_test\npython lenora.py run_test\npython lenora.py run_test_output`,
      },
      {
        title: "Test route logic directly with ASGI clients",
        body: "Use HTTPX's ASGI transport to exercise an application without opening a network port. Keep test databases isolated from development or production data.",
        code: `import httpx\n\nasync def test_health(app):\n    transport = httpx.ASGITransport(app=app)\n    async with httpx.AsyncClient(\n        transport=transport, base_url="http://test"\n    ) as client:\n        response = await client.get("/health")\n    assert response.status_code == 200`,
      },
    ],
  },
  {
    id: "deploy",
    group: "Ship it",
    title: "Configuration and deployment",
    eyebrow: "GUIDE 19 · OPERATIONS",
    summary: "Configure the server, database, secrets, proxy boundary, and production process.",
    readTime: "6 min",
    tags: ["production", "uvicorn", "settings", "host", "port", "deployment", "secret"],
    steps: [
      {
        title: "Set deployment configuration",
        body: "The generated settings module controls host, port, database type and URL, async mode, docs paths, and security settings. Defaults target local development.",
        code: `# settings.py\nHOST = ""  # blank uses 127.0.0.1\nPORT = 8009\nDATABASE_TYPE = "postgresql"\nDATABASE_URL = "postgresql+psycopg://user:password@db/app"\nACTIVATE_ASYNC = True`,
      },
      {
        title: "Distinguish omitted values from None",
        body: "LENAPI() inherits optional configuration from settings.py when an argument is omitted. Passing None explicitly can disable options such as Swagger docs or request body limits. Use the public UNSET sentinel in your own functions when omission and None need different meanings.",
        code: `from lenapi import LENAPI, UNSET\n\n# Explicitly disable docs and body limits, even if settings.py enables them.\napp = LENAPI(docs_url=None, max_request_body_size=None)\n\ndef update_value(value=UNSET):\n    if value is UNSET:\n        return \"leave the stored value unchanged\"\n    return value  # None is an explicit value and may clear a nullable field.`,
        note: "For Pydantic PATCH bodies, use model_dump(exclude_unset=True); Pydantic already tracks the fields the client sent.",
      },
      {
        title: "Run a production ASGI server",
        body: "Run Uvicorn against the application object. Use a process manager or container platform to supervise production workers, and configure trusted proxy behavior at the edge.",
        code: `uvicorn main:app --host 0.0.0.0 --port 8009`,
      },
      {
        title: "Build and run with Docker",
        body: "Use a slim Python image, install Git during the build if requirements install LenAPI from a Git URL, install dependencies, and run Uvicorn on the container interface. Keep local secrets and database files out of the build context. Run the schema migration before the first request when database-backed security storage is enabled. Persist SQLite storage with a volume, or use a managed SQL database for production.",
        code: `FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN apt-get update && apt-get install -y --no-install-recommends git && pip install --no-cache-dir -r requirements.txt && apt-get purge -y --auto-remove git && rm -rf /var/lib/apt/lists/*
COPY . .
EXPOSE 8009
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8009"]

# .dockerignore should include .env, .venv/, __pycache__/, *.db, and .git/.
docker build -t my-lenapi-app .
docker volume create lenapi-data
docker run --rm --env-file .env --mount source=lenapi-data,target=/data -e DATABASE_URL=sqlite:////data/lenapi.db my-lenapi-app python lenora.py migration
docker run --rm -p 8009:8009 --env-file .env --mount source=lenapi-data,target=/data -e DATABASE_URL=sqlite:////data/lenapi.db my-lenapi-app`,
      },
      {
        title: "Deploy from Coolify",
        body: "Create an application from the Git repository, select the Dockerfile build pack, and point Coolify at the directory containing the app Dockerfile. Set the container port to match EXPOSE, add secrets through Coolify environment variables, attach persistent storage if using SQLite, and configure the HTTPS domain. Run migrations once as a deployment or release step before serving traffic.",
        code: `# Coolify application settings
Build pack: Dockerfile
Dockerfile: ./Dockerfile
Port: 8009
Start command: use the Dockerfile CMD

# Add in Coolify environment settings:
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql+psycopg://user:password@db/app
SECRET_KEY=<generated-secret>

# Deployment migration step:
python lenora.py migration
python lenora.py migrate`,
        note: "Do not commit production .env files or database files. If Coolify builds from a monorepo, set the build context and Dockerfile path to the generated LenAPI project directory.",
      },
      {
        title: "Protect secrets and persistent data",
        body: "Keep generated signing keys, OAuth client secrets, and API keys outside source control. Use HTTPS, persistent database storage, shared throttle/session storage for multiple workers, and backups.",
        note: "The built-in WebSocket room manager and memory cache are process-local. Use a shared backend or external service when scaling across processes or hosts.",
      },
      {
        title: "Use the docs and health endpoints deliberately",
        body: "Swagger and OpenAPI are enabled by default and can be renamed or protected. Decide whether your production API documentation should be public or gated by the database-backed admin session feature.",
        code: `app = LENAPI(\n    title="My API",\n    version="1.0.0",\n    docs_url="/docs/",\n    openapi_url="/openapi.json",\n)`,
      },
    ],
  },
];

export const guideGroups = Array.from(new Set(guides.map((guide) => guide.group))).map((group) => ({
  title: group,
  guides: guides.filter((guide) => guide.group === group),
}));
