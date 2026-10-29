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
    tags: ["introduction", "overview", "asgi", "pydantic", "sqlalchemy", "framework", "admin", "mount", "multi-project", "webhook", "private files", "monitoring", "sqlite", "mysql", "postgresql", "mongodb", "beta", "database"],
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
          "Public and private file uploads, middleware, optional gzip, and request throttling",
          "Sync/async cache operations and durable background queues with retry and delay options",
          "An optional model admin console with per-model permissions and resource monitoring",
          "Independent projects that can run separately or mount under a chosen URL prefix",
          "Optional OpenAI, Ollama, and Faker integrations",
        ],
      },
      {
        title: "Which databases can you use?",
        body: "LenAPI's supported SQL databases are SQLite (the default), MySQL, and PostgreSQL. MongoDB is the non-relational option and is currently in beta: its separate MongoDocument API is available for developers who want to try it and share feedback. MongoDB does not yet have the same relationship and migration workflow as the SQL backends, so review its guide and limitations before choosing it for production.",
        list: [
          "SQL: SQLite, MySQL, and PostgreSQL use LenAPI's SQL model and migration workflow.",
          "Non-relational beta: MongoDB uses MongoDocument for document-based sync and async CRUD and is open for testing.",
        ],
        note: "Changing DATABASE_TYPE selects the backend; it does not convert existing SQL models, tables, or data. See the MongoDB guide for setup, model differences, and migration limitations.",
      },
      {
        title: "How this documentation is organized",
        body: "Start with the quickstart to install LenAPI and create your first app. Then follow the guides for routing, validation, data access, security, realtime features, testing, and deployment. Each guide includes practical code you can adapt.",
        code: `# main.py in a project created with lenora startproject\nfrom lenapi_bootstrap import create_app\n\n# Keep this at the top of the application setup.\napp = create_app(__file__, __package__)\n\n@app.get("/health")\ndef health():\n    return {"status": "ok"}`,
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
        body: "The scaffold separates application code from framework internals. It includes settings, a main module, app models and schemas, tests, and migrations. Its main.py uses the project bootstrap helper rather than constructing a bare LENAPI instance.",
        code: `lenora startproject myproject\ncd myproject`,
      },
      {
        title: "Initialize the generated project app first",
        body: "At the top of main.py, call create_app(__file__, __package__) before registering routes or routers. The helper loads this project's settings and app.models, configures its project namespace, and creates LENAPI with those settings. Keep using the returned app; assigning app = LENAPI() afterward replaces it and can lose its configuration and routes.",
        code: `# main.py\nfrom lenapi_bootstrap import create_app\n\napp = create_app(__file__, __package__)`,
        note: "This bootstrap is for projects generated by LenAPI. Small standalone examples that do not use a generated project can instantiate LENAPI() directly.",
      },
      {
        title: "Add a typed route",
        body: "With app initialized by create_app at the top of main.py, register routes and routers on that same app. LenAPI reads the Pydantic model from the handler signature, validates the incoming JSON body, and documents the operation in OpenAPI.",
        code: `# main.py\nfrom pydantic import BaseModel\nfrom lenapi_bootstrap import create_app\nfrom lenapi import Router\n\napp = create_app(__file__, __package__)\napi = Router(prefix="/api")\n\nclass Greeting(BaseModel):\n    name: str\n\n@api.post("/hello")\nasync def hello(data: Greeting):\n    return {"message": f"Hello, {data.name}!"}\n\napp.include_router(api)`,
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
    id: "mounting-projects",
    group: "Build APIs",
    title: "Mount independent projects",
    eyebrow: "PROJECT GUIDE · ARCHITECTURE",
    summary: "Keep apps independently configured, then mount sibling projects under URL prefixes when useful.",
    readTime: "5 min",
    tags: ["mount", "app.mount", "projects", "subpath", "PROJECT_NAME", "database namespace", "admin"],
    steps: [
      {
        title: "Keep each project independent",
        body: "Every project created with lenora startproject has its own settings.py, models, schemas, migrations, and database URL. You can run each project as a separate server, or mount one project into another. Mounting is optional and does not merge their settings or databases.",
        code: `workspace/\n├── win/\n│   ├── main.py\n│   ├── settings.py\n│   └── app/\n└── games/\n    ├── main.py\n    ├── settings.py\n    └── app/`,
      },
      {
        title: "Mount a sibling at the URL prefix you choose",
        body: "Call app.mount(path, project_name) in the primary project's main.py. The project name identifies the sibling directory; the URL prefix is your choice and does not have to match that project name. The sibling must have its own PROJECT_NAME in settings.py.",
        code: `# win/main.py — primary project\nfrom lenapi import LENAPI\n\napp = LENAPI()\napp.mount("/gamer", "games")\n\n# The sibling app's routes and docs are available under:\n# /gamer/       child project's home route\n# /gamer/docs/  child project's Swagger UI\n# /gamer/redoc/ child project's ReDoc`,
        note: "The project name passed to mount() must match a sibling project directory. The path is a separate routing choice: app.mount('/arcade', 'games') is valid too.",
      },
      {
        title: "Keep databases and migrations separate",
        body: "A mounted project loads its own settings and connects to its own DATABASE_URL. LenAPI namespaces its relational tables using the project namespace, so two projects can use one database server without treating each other's tables or migration state as their own. You can also configure separate database servers.",
        code: `# win/settings.py\nPROJECT_NAME = "win"\nDATABASE_TYPE = "sqlite"\nDATABASE_URL = "sqlite:///win.db"\n\n# games/settings.py\nPROJECT_NAME = "games"\nDATABASE_TYPE = "postgresql"\nDATABASE_URL = "postgresql://user:password@localhost:5432/games"`,
        note: "Run each project's migration commands from that project's directory. Mounting does not migrate a child project's schema on its behalf.",
      },
      {
        title: "Choose mounting or separate servers",
        body: "Mount projects when one ASGI process and domain should serve multiple apps under path prefixes. Run projects independently when you want separate ports, deployments, scaling, or failure boundaries. A reverse proxy can route domains or paths to independently deployed servers too.",
        code: `# Start each app independently from its own project directory\ncd win && python lenora.py run\ncd ../games && python lenora.py run`,
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
        body: "Fields include AutoField, IntegerField, PositiveIntegerField, BigIntegerField/BigIntField, PositiveBigIntegerField, StringField, TextField, EmailField, PhoneField, IPField, URLField, BooleanField, FloatField, DecimalField, DateField, TimeField, DateTimeField, DurationField, JSONField/Json, UUIDField, ImageField, FileField, FileImageField, ForeignKeyField, OneToOneField, and ManyToManyField. Most fields default to nullable=True and blank=True; BooleanField defaults to True. JSONField stores JSON-compatible dictionaries, lists, strings, numbers, booleans, or null. Use a factory such as default=dict for mutable defaults.",
        code: `class ExamResult(model.Model):\n    score = model.DecimalField(max_digits=6, decimal_places=2)\n    details = model.Json(default=dict)\n    is_published = model.BooleanField(default=False, nullable=False)\n\nresult = ExamResult.create(\n    score=92.50,\n    details={"course": "Python", "attempt": 1},\n    is_published=True,\n)`,
        note: "LenAPI validates values for EmailField, PhoneField, IPField, URLField, UUIDField, and positive integer fields when a model is saved. Keep Pydantic request schemas as the API boundary: they validate and document request input before database logic runs.",
      },
      {
        title: "Validate model values and customize errors",
        body: "Email, international phone number, IP, URL, UUID, and nonnegative integer fields are validated when save() or asave() is called. A validation failure raises HTTP 422. Phone values must start with + and contain no more than 18 characters. IPField accepts IPv4 and IPv6. Customize a validation message with error_messages; unique is available for unique columns.",
        code: `class Customer(model.Model):
    email = model.EmailField(
        unique=True,
        error_messages={
            "email": "This is not an email",
            "unique": "An account already uses this email",
        },
    )
    phone = model.PhoneField(max_length=18)
    ip_address = model.IPField()
    website = model.URLField()
    age = model.PositiveIntegerField(nullable=False)
    public_id = model.UUIDField()

# Invalid values raise HTTPException(422, ...).
# Positive* fields also have a database CHECK constraint, protecting direct SQL writes.`,
      },
      {
        title: "Use date, time, and duration fields",
        body: "DateField, TimeField, and DateTimeField default to the current UTC date/time when no explicit default is supplied. Set auto_add_now=False to opt out. DurationField stores a fixed datetime.timedelta; calendar months and years need calendar-aware date arithmetic.",
        code: `from datetime import datetime, timezone
from lenapi import model

class Subscription(model.Model):
    started_at = model.DateTimeField()
    started_on = model.DateField()
    reminder_at = model.TimeField()
    trial_length = model.DurationField(weeks=1)

subscription = Subscription.create()
expires_at = datetime.now(timezone.utc) + subscription.trial_length
# weeks=1 stores datetime.timedelta(days=7), then add it to a start time.`,
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
        title: "Define one-to-one and one-to-many relationships",
        body: "One-to-one and one-to-many both use foreign keys, but their cardinality differs. OneToOneField places a unique foreign key on the dependent model, so each learner has at most one profile. For one-to-many, put a regular ForeignKeyField on the many-side: each learner points to one classroom, while a classroom can have many learners. There is no separate OneToManyField. Use special() to resolve a foreign key from one loaded row; use filter() to fetch the many-side rows.",
        code: `class Classroom(model.Model):
    name = model.StringField(max_length=120)

class Learner(model.Model):
    classroom_id = model.ForeignKeyField(
        "classroom.id", nullable=True, model=model.null
    )

class LearnerProfile(model.Model):
    learner_id = model.OneToOneField(
        "learner.id", nullable=False, model=model.CASCADE
    )
    biography = model.TextField(default="")

# Foreign key: resolve one learner's classroom (sync).
learner = Learner.get(id=1).special("classroom_id")
classroom = learner.classroom_id  # Classroom instance, or None

# One-to-many: list all learners assigned to the classroom.
learners = Learner.filter(classroom_id=classroom.id).all()

# One-to-one: fetch the learner's single profile.
profile = LearnerProfile.get(learner_id=learner.id).get()

# Async one-to-many and one-to-one queries.
learners = await Learner.afilter(classroom_id=classroom_id).all()
profile = await LearnerProfile.aget(learner_id=learner_id)`,
        note: "OneToOneField creates a unique constraint automatically. The foreign key uses SET NULL here, so classroom_id must be nullable. Run python lenora.py migration after changing these models.",
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
        title: "Positive fields and interrupted MySQL migrations",
        body: "PositiveIntegerField and PositiveBigIntegerField generate one named database CHECK constraint each. LenAPI prevents Alembic's metadata-copy step from duplicating those constraints, which MySQL rejects as a duplicate constraint name. If a revision generated by an older framework version contains repeated identical sa.CheckConstraint(...) entries, fix or regenerate that unapplied revision before applying it. MySQL DDL is not transactional: a failed migration can leave earlier project tables behind without recording a revision. Inspect showmigrations and the tables in the current project namespace before retrying. For disposable data, delete_migrations can reset this project's objects and local revisions after you confirm; preserve needed data by reconciling the partial schema instead.",
        code: `# Inspect local revision files and applied database state
python lenora.py showmigrations

# Only when this project's data can be discarded; prompts for confirmation
python lenora.py delete_migrations
python lenora.py migration`,
        note: "Do not assume a failed MySQL migration rolled back earlier CREATE TABLE statements. delete_migrations is destructive within the current project's namespace; other project namespaces remain untouched.",
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
        body: "clear_migrations removes local revision files and this project's Alembic version state only when this project has no application tables. delete_migrations is a confirmed destructive reset: it drops tables and views in this project's SQL namespace, or collections in this project's MongoDB namespace, and deletes local revision files. Other project namespaces are untouched. It removes this project's application data too; back up first and use it only when you intend to start from a clean project database.",
        code: `# Limited to an empty SQL database\npython lenora.py clear_migrations\n\n# Full destructive reset; prompts for y/n confirmation\npython lenora.py delete_migrations\n\n# Then create and apply a fresh initial revision\npython lenora.py migration`,
        note: "MongoDB has no Alembic history: showmigrations reports that fact, migration/migrate initialize missing collections, repair-migrations and clear_migrations are SQL-only, and delete_migrations drops this project's namespaced collections after confirmation.",
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
    id: "mongodb",
    group: "Data layer",
    title: "MongoDB CRUD (beta)",
    eyebrow: "DATABASE GUIDE · DOCUMENT CRUD",
    summary: "Configure MongoDB and create, read, update, and delete documents with LenAPI's separate MongoDocument API.",
    readTime: "8 min",
    tags: ["mongodb", "mongo", "non-relational", "nosql", "beta", "crud", "MongoDatabase", "MongoDocument", "PyMongo", "document", "collection", "async"],
    steps: [
      {
        title: "Understand the beta API and install its driver",
        body: "MongoDB is currently a beta backend. It uses MongoDocument and MongoDatabase, not SQL model.Model. SQL relationships, SQL query helpers, and Alembic schema revisions do not apply to MongoDB documents. Install LenAPI's MongoDB extra, which includes the official PyMongo driver.",
        code: `python -m pip install 'lenapi[mongodb]'`,
        note: "Use this guide to test document CRUD and provide feedback. MongoDB document fields are schema-flexible; changing a Python field does not run an Alembic migration.",
      },
      {
        title: "Select MongoDB in settings.py",
        body: "Choose MongoDB as the project's one active database and include the database name in the URI path. ACTIVATE_ASYNC controls whether LenAPI also creates the asynchronous MongoDB client. Store production credentials in your deployment secret manager or environment variables, not in committed source.",
        code: `# settings.py\nDATABASE_TYPE = "mongodb"\nDATABASE_URL = "mongodb://127.0.0.1:27017/school"\nACTIVATE_ASYNC = False  # Set True if routes will use async MongoDocument methods`,
        note: "For a managed MongoDB service, use its connection URI and URL-encode reserved characters in credentials. If the URI has no database path, configure MONGODB_DATABASE.",
      },
      {
        title: "Define and bind a MongoDocument",
        body: "A MongoDocument subclass is a Pydantic document model. Set collection_name to choose its collection; otherwise LenAPI uses the lower-case class name. Bind the class to the MongoDatabase created by LENAPI before serving requests. MongoDocument supplies an optional string id mapped to MongoDB's _id.",
        code: `# app/models.py\nfrom lenapi import MongoDocument\n\nclass Student(MongoDocument):\n    collection_name = "students"\n    name: str\n    course: str\n\n# main.py\nfrom lenapi import LENAPI\nfrom app.models import Student\n\napp = LENAPI()\nStudent.bind(app.mongodb)`,
      },
      {
        title: "Implement synchronous create, read, update, and delete routes",
        body: "Use Student.create() to validate and insert a document, Student.get() for one exact-match lookup, and Student.filter() for exact-match lists. Change fields on the returned document and call save() to update it; call delete() to remove it. MongoDB IDs are strings, so declare the path id as str.",
        code: `from pydantic import BaseModel\nfrom lenapi import HTTPException\nfrom app.models import Student\n\nclass StudentInput(BaseModel):\n    name: str\n    course: str\n\n@app.post("/students")\ndef create_student(data: StudentInput):\n    student = Student.create(**data.model_dump())\n    return student.model_dump(mode="json")\n\n@app.get("/students")\ndef list_students(course: str | None = None):\n    students = Student.filter(course=course) if course else Student.all()\n    return [student.model_dump(mode="json") for student in students]\n\n@app.get("/students/{student_id}")\ndef get_student(student_id: str):\n    student = Student.get(id=student_id)\n    if student is None:\n        raise HTTPException(404, "Student not found")\n    return student.model_dump(mode="json")\n\n@app.put("/students/{student_id}")\ndef update_student(student_id: str, data: StudentInput):\n    student = Student.get(id=student_id)\n    if student is None:\n        raise HTTPException(404, "Student not found")\n    student.name = data.name\n    student.course = data.course\n    student.save()\n    return student.model_dump(mode="json")\n\n@app.delete("/students/{student_id}")\ndef delete_student(student_id: str):\n    student = Student.get(id=student_id)\n    if student is None:\n        raise HTTPException(404, "Student not found")\n    student.delete()\n    return {"deleted": True, "id": student_id}`,
        note: "filter() and all() currently return the matching documents as a Python list; avoid loading an unbounded collection in a large production dataset. Use an index for fields queried frequently.",
      },
      {
        title: "Use the async document methods",
        body: "Set ACTIVATE_ASYNC = True before constructing LENAPI, then await MongoDocument's async methods. The method names are acreate, aget, afilter, aall, asave, and adelete. Do not call the synchronous variants from an async handler when you want non-blocking MongoDB I/O.",
        code: `# settings.py\nACTIVATE_ASYNC = True\n\n# Async routes\n@app.post("/async/students")\nasync def create_student_async(data: StudentInput):\n    student = await Student.acreate(**data.model_dump())\n    return student.model_dump(mode="json")\n\n@app.get("/async/students/{student_id}")\nasync def get_student_async(student_id: str):\n    student = await Student.aget(id=student_id)\n    if student is None:\n        raise HTTPException(404, "Student not found")\n    return student.model_dump(mode="json")\n\n@app.get("/async/students")\nasync def list_students_async(course: str | None = None):\n    students = await Student.afilter(course=course) if course else await Student.aall()\n    return [student.model_dump(mode="json") for student in students]\n\n@app.put("/async/students/{student_id}")\nasync def update_student_async(student_id: str, data: StudentInput):\n    student = await Student.aget(id=student_id)\n    if student is None:\n        raise HTTPException(404, "Student not found")\n    student.name = data.name\n    student.course = data.course\n    await student.asave()\n    return student.model_dump(mode="json")\n\n@app.delete("/async/students/{student_id}")\nasync def delete_student_async(student_id: str):\n    student = await Student.aget(id=student_id)\n    if student is None:\n        raise HTTPException(404, "Student not found")\n    await student.adelete()\n    return {"deleted": True, "id": student_id}`,
      },
      {
        title: "Filter documents, add indexes, and know the limits",
        body: "MongoDocument.get() and filter() accept exact field-value matches, including id. Use count() for counts and ensure_index() for indexes. The current filter API does not expose SQL-style operators, relationship traversal, or paginated query results. MongoDB collections are created on first write; lenora.py migration or migrate can initialize imported document collections and framework state, but they do not generate Alembic revisions for field changes.",
        code: `# Exact match and count\nstudent = Student.get(course="Python")\npython_count = Student.count(course="Python")\n\n# Create a unique index once during setup\nStudent.ensure_index("email", unique=True)\n\n# Async equivalents\nstudent = await Student.aget(course="Python")\npython_count = await Student.acount(course="Python")\nawait Student.aensure_index("email", unique=True)\n\n# Initialize imported MongoDocument collections\npython lenora.py migration\npython lenora.py migrate`,
        note: "Switching DATABASE_TYPE from SQL to MongoDB does not copy or convert SQL tables and rows. Define and bind MongoDocument classes, then migrate data separately if needed. Review the beta status before choosing MongoDB for production.",
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
        body: "JWT and Basic authentication can use a developer model by passing user_model. For JWT, identifier_field selects both the model column used for lookup and the JSON field accepted by POST /auth/token; it defaults to username. For Basic login, set BASIC_AUTH_FIELD in settings.py or pass identifier_field. The password column must contain a LenAPI-compatible one-way hash. The framework default User remains available for quick setup.",
        code: `from lenapi_bootstrap import create_app\nfrom lenapi import authentication\n\napp = create_app(__file__, __package__)\nfrom app.models import Customer\n\n# Customer must have email and password columns.\nemail_jwt = authentication(\n    "jwt", user_model=Customer, identifier_field="email", app=app\n)\nemail_basic = authentication(\n    "basic_login", user_model=Customer, identifier_field="email", app=app\n)`,
        note: "Pass the LENAPI app to app= when you want JWT refresh-token replay checks to use its shared security store. Do not pass a Router as app.",
      },
      {
        title: "Mount email-based JWT token routes",
        body: "Create the app before importing route modules, configure JWT with your model's email field, then mount auth.router(). The token endpoint accepts email and password when identifier_field is email. Your registration or provisioning flow must store a password hash in the model's password column.",
        code: `# main.py\nfrom lenapi_bootstrap import create_app\nfrom lenapi import Depends, authentication\n\napp = create_app(__file__, __package__)\nfrom app.models import ProjectAdmin\n\nauth = authentication(\n    "jwt",\n    user_model=ProjectAdmin,\n    identifier_field="email",\n    app=app,\n)\n\napp.include_router(auth.router())  # POST /auth/token and /auth/refresh\n\n@app.get("/admin/profile", auth=auth)\ndef admin_profile(identity=Depends(auth)):\n    return {"admin_id": identity["sub"]}\n\n# POST /auth/token JSON body:\n# {"email": "admin@example.com", "password": "..."}`,
        note: "This only configures login verification and token issuance. Create admins through a trusted registration/provisioning flow, and store passwords with make_password().",
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
        title: "Understand what SocialAuth returns",
        body: "jwt_enabled controls the credential LenAPI issues after the provider callback. In the current implementation, the only built-in LenAPI credential it issues is a JWT access token. It does not issue API keys, session cookies, opaque bearer tokens, or refresh tokens. The provider OAuth access token is used internally to fetch the provider profile and is not returned. With jwt_enabled=False, the callback returns identity and user_id when a local user was resolved, but no LenAPI token.",
        code: `# With auto_register=True and jwt_enabled=True, the callback response
# has this shape; identity fields depend on the provider:
{
    "identity": {"sub": "provider-subject", "email": "ada@example.com"},
    "user_id": 42,
    "access_token": "<LenAPI JWT>",
    "token_type": "bearer",
    "expires_in": 3600,
}

# Without jwt_enabled=True, the response has identity and, if resolved,
# user_id. It does not contain access_token or token_type.
# Send the LenAPI access token to protected routes as:
# Authorization: Bearer <access_token>`,
        note: "To issue a session, API key, or opaque token after social login, implement that credential flow explicitly after callback or use a custom callback. Keep provider tokens and LenAPI tokens distinct.",
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
    tags: ["middleware", "gzip", "throttle", "rate limit", "ip", "csrf", "docs", "cors", "redis", "REDIS_URL", "CACHE_BACKEND", "SECURITY_STORAGE", "request id", "timing", "install redis"],
    steps: [
      {
        title: "How middleware works",
        body: "Middleware is optional ASGI code that wraps requests and responses around your routes. Add it with app.add_middleware; the first added middleware wraps the later ones. LenAPI's built-ins include CORS, gzip compression, request IDs, timing headers, and documentation authentication. Add only the middleware your application needs.",
        code: `from lenapi.middleware import (\n    CORSMiddleware, GZipMiddleware, RequestIDMiddleware, TimingMiddleware,\n)\n\napp.add_middleware(RequestIDMiddleware)\napp.add_middleware(TimingMiddleware)\napp.add_middleware(GZipMiddleware, minimum_size=500)\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=["https://frontend.example"],\n    allow_methods=["GET", "POST", "PATCH", "DELETE"],\n    allow_headers=["authorization", "content-type"],\n)`,
        list: [
          "CORSMiddleware controls which browser origins, methods, and headers are allowed. Use explicit frontend origins in production; credentialed requests cannot use a wildcard origin.",
          "GZipMiddleware compresses eligible response bodies when the client accepts gzip. minimum_size sets the size threshold; compresslevel ranges from 0 through 9.",
          "RequestIDMiddleware accepts a safe request ID or creates one, then returns it in X-Request-ID for log correlation.",
          "TimingMiddleware returns app processing time in X-Process-Time-Ms; it is not full network latency.",
          "DocsAuthMiddleware protects configured Swagger, ReDoc, and OpenAPI paths using a callable authenticator.",
        ],
      },
      {
        title: "Configure CORS for a browser client",
        body: "CORS is a browser policy, not API authentication. List the frontend origin and allow the methods and headers it actually sends. Expose response headers if browser JavaScript needs to read them. If cookies are used, enable allow_credentials and list exact origins instead of using a wildcard.",
        code: `app.add_middleware(\n    CORSMiddleware,\n    allow_origins=["https://frontend.example"],\n    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],\n    allow_headers=["authorization", "content-type", "X-Flutterwave"],\n    expose_headers=["X-Request-ID", "X-Process-Time-Ms"],\n    allow_credentials=False,\n)`,
        note: "If the frontend uses cookie authentication, set allow_credentials=True and keep allow_origins as an explicit list of origins. CORS does not replace authentication or CSRF protection.",
      },
      {
        title: "Add compression and request observability",
        body: "GZipMiddleware compresses eligible text, JSON, XML, JavaScript, WebAssembly, and SVG response types when Accept-Encoding permits it. It skips content that is already encoded or partial. Request ID and timing middleware add response headers that can be used by clients and logs.",
        code: `app.add_middleware(RequestIDMiddleware)\napp.add_middleware(TimingMiddleware)\napp.add_middleware(GZipMiddleware, minimum_size=500, compresslevel=6)\n\n# Example response headers:\n# X-Request-ID: 9af...\n# X-Process-Time-Ms: 2.731\n# Content-Encoding: gzip  (when response qualifies)`,
        note: "Compression uses Python's standard library. It does not add a Starlette dependency. Choose a sensible minimum_size to avoid spending CPU compressing tiny responses.",
      },
      {
        title: "Choose database or Redis for shared security state",
        body: "Set REDIS_URL to the Redis server connection string. CACHE_BACKEND controls app.cache only; SECURITY_STORAGE independently controls shared sessions, API throttling/IP cooldown, opaque tokens, and HMAC nonce replay checks. To put both cache and security state in Redis, set both backend settings. Redis must be installed and running separately from the Python client package.",
        code: `# settings.py\nREDIS_URL = "redis://127.0.0.1:6379/0"\nCACHE_BACKEND = "redis"\nSECURITY_STORAGE = "redis"\n\n# Install the Python Redis client in this project's environment:\npython -m pip install 'lenapi[redis]'\n\n# Confirm the Redis server responds:\nredis-cli ping  # PONG`,
        note: "The URL format is redis://host:port/database-number; this uses localhost, port 6379, database 0. The quoted brackets are important in zsh. Installing lenapi[redis] adds the Python client, not the Redis server. If you want the cache in Redis but security state in SQL, leave SECURITY_STORAGE='database'.",
      },
      {
        title: "Configure rate limits",
        body: "Set app-level limits on LENAPI to provide defaults for routes. A route or router with its own throttle mapping replaces the inherited mapping; it does not merge with it. Repeat any global scopes you still want enforced on that route. ip counts by client IP, anonymous counts unauthenticated calls, and authenticated counts a verified identity from auth=.",
        code: `app = LENAPI(throttle={\n    "ip": "300/minute",\n    "anonymous": "30/minute",\n    "authenticated": "600/minute",\n})\n\n# Uses the app-level defaults.\n@app.get("/items")\ndef items():\n    return {"items": []}\n\n# Replaces the defaults for /login. Keep the scopes needed here.\n@app.post("/login", throttle={\n    "ip": "5/minute",\n    "anonymous": "30/minute",\n})\ndef login(data: LoginInput):\n    return verify_credentials(data)`,
        note: "If login used only throttle={\"ip\": \"5/minute\"}, only that route-specific limit would apply; the global anonymous limit would not. An explicit throttle={} disables inherited limits. BasicAuth has a default 10-per-minute IP limit unless a pre-auth IP/anonymous limit is configured. Process-memory counters do not coordinate across workers.",
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
        body: "A dependency is a normal sync or async callable. Its typed inputs are resolved like endpoint parameters. If a dependency and route both declare user_id, LenAPI passes the matching path value into the dependency, then injects its return value into the route parameter.",
        code: `from lenapi import Depends, LENAPI\n\napp = LENAPI()\n\ndef current_user(user_id: int):\n    return {"id": user_id, "name": "Tolu"}\n\n@app.post("/profile/{user_id}")\ndef profile(user_id: int, user: dict = Depends(current_user)):\n    return user`,
        note: "For POST /profile/12, current_user receives user_id=12 and profile receives the dependency result as user. This example demonstrates injection; replace it with real authentication and authorization logic before using it to protect data.",
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
    id: "admin-console",
    group: "Security",
    title: "Admin console and project models",
    eyebrow: "OPERATIONS GUIDE · ADMINISTRATION",
    summary: "Enable the optional model admin, choose exposed models and fields, and manage mounted projects from one primary login.",
    readTime: "7 min",
    tags: ["admin", "admin UI", "app/admin.py", "ADMIN_ENABLED", "permissions", "monitoring", "CPU", "RAM", "mounted projects"],
    steps: [
      {
        title: "Enable the admin console",
        body: "The optional /admin/ console is separate from protected Swagger/ReDoc docs. Enable it in settings.py, create the framework tables with migration, then create the first admin through the CLI. Admin accounts are stored in the configured database. Do not add passwords to a URL or source file.",
        code: `# settings.py\nADMIN_ENABLED = True\nADMIN_URL = "/admin/"\nADMIN_MONITORING_ENABLED = True\n\n# First setup, from the generated project directory\npython lenora.py migration\npython lenora.py admin\npython lenora.py run`,
        note: "Keep the admin console disabled when it is not needed. Use HTTPS in deployed environments and protect admin credentials as production secrets.",
      },
      {
        title: "Explicitly register the models and fields to expose",
        body: "Create app/admin.py and register only the models the admin should manage. fields sets the visible/editable allow-list, readonly shows a field without permitting edits, and exclude hides sensitive fields. Credential fields remain protected. The admin supports listing, reading, editing, and deleting records; create records through your app's own API or service logic.",
        code: `# app/admin.py\nfrom lenapi.admin import admin\nfrom .models import Student, Course, Invoice, Staff\n\nadmin.register(\n    Student,\n    fields=("person_name", "course", "email", "profile_image"),\n    readonly=("email",),\n    exclude=("password", "private_notes"),\n)\n\nadmin.register(Course, fields=("title", "description", "is_active"))\n\nadmin.register(\n    Invoice,\n    fields=("invoice_number", "student_id", "amount", "status"),\n    readonly=("invoice_number",),\n    exclude=("payment_token", "provider_response"),\n)\n\nadmin.register(\n    Staff,\n    fields=("name", "work_email", "department"),\n    readonly=("work_email",),\n    exclude=("password", "salary", "hr_notes"),\n)`,
      },
      {
        title: "Grant access per model",
        body: "A superadmin can create admin accounts and grant view, read, write, and delete access per model. view controls whether the model appears in navigation; read permits listing/viewing records; write permits updates; delete permits removal. Keep permissions narrow because the admin UI operates directly on registered model data.",
      },
      {
        title: "Use one admin entry for mounted projects",
        body: "When the primary app mounts sibling projects with app.mount(), its /admin/ groups registered models under each project name and runs queries through each project's own database configuration. Enable admin and create the admin login only in the primary project. In mounted projects, keep ADMIN_ENABLED=False and use their own app/admin.py files to register exposed models. The primary admin only discovers projects that are actually mounted.",
        code: `# win/main.py\nfrom lenapi import LENAPI\n\napp = LENAPI()\napp.mount("/gamer", "games")\n\n# win/settings.py\nADMIN_ENABLED = True\n\n# games/settings.py\nADMIN_ENABLED = False\n\n# games/app/admin.py\nfrom lenapi.admin import admin\nfrom .models import Game\n\nadmin.register(Game, fields=("title", "is_published"))`,
        note: "Mounted-project permission keys are prefixed with the project name, for example games:game. Same-named models in different projects therefore keep distinct permissions.",
      },
      {
        title: "Optionally monitor the application process",
        body: "With the admin enabled, install the monitoring extra and enable ADMIN_MONITORING_ENABLED. The page displays CPU and RAM metrics, the LenAPI process ID, and thread count. This is an on-demand operational view, not an alerting system or full host monitoring service.",
        code: `python -m pip install 'lenapi[monitoring]'\n\n# settings.py\nADMIN_ENABLED = True\nADMIN_MONITORING_ENABLED = True`,
      },
    ],
  },
  {
    id: "websockets",
    group: "Realtime and services",
    title: "WebSockets: chat, video signaling, JSON, text, and bytes",
    eyebrow: "GUIDE 14 · REALTIME",
    summary: "Mount a ready-made WebSocket service or handle low-level ASGI WebSocket connections directly.",
    readTime: "12 min",
    tags: ["websocket", "WebSocketService", "chat", "video", "json", "text", "message", "byte", "binary", "rooms", "room_id", "WebRTC", "heartbeat", "origin", "authentication", "send", "disconnect"],
    steps: [
      {
        title: "Configure trusted browser origins",
        body: "WebSockets keep a two-way connection open for chat, live updates, notifications, and WebRTC signaling. Set WEBSOCKET_ALLOWED_ORIGINS in settings.py to the exact browser origins that may open a socket. The generated default is an empty list, so the handshake is rejected until you add an origin.",
        code: `# settings.py\nWEBSOCKET_ALLOWED_ORIGINS = [\n    "http://127.0.0.1:8009",\n    "https://app.example.com",\n]`,
        note: "An origin includes scheme, hostname, and optional port. Origin checks are not user authentication. Add an authenticator to private sockets, and always check whether the authenticated user may join the requested room.",
      },
      {
        title: "Create and mount an authenticated chat service",
        body: "WebSocketService configures the URL, accepted message shape, optional authentication callback, origin allowlist, payload-size limit, heartbeat, and connection limits. If allowed_origins is omitted, LenAPI reads WEBSOCKET_ALLOWED_ORIGINS from settings.py. An authenticator is a sync or async callable receiving a Request; return an identity when allowed, or None/False to reject.",
        code: `from lenapi import LENAPI, WebSocketService\n\napp = LENAPI()\n\ndef authenticate(request):\n    # Replace with real session/token validation.\n    session_id = request.cookies.get("session_id")\n    return {"user_id": "123"} if session_id == "valid-session" else None\n\nchat = WebSocketService(\n    path="/ws/chat/{room_id}",\n    type="chat",\n    auth=authenticate,\n    max_message_size=64_000,\n    heartbeat_seconds=30,\n    max_connections=6,\n    max_total_connections=100,\n)\napp.include_router(chat.router())`,
        note: "Browser WebSocket APIs cannot set arbitrary Authorization headers. Browser applications typically authenticate with a secure HttpOnly cookie or a custom authenticator that validates a short-lived credential. Do not treat a room ID as an access-control check.",
      },
      {
        title: "Create a room and invite participants",
        body: "Generate the room ID with an ordinary HTTP endpoint, then pass the returned WebSocket path to participants. The service adds the room to its in-memory map when the first socket connects. A random ID can make guessing harder, but it is not authorization and is not stored as a durable room record.",
        code: `from uuid import uuid4\nfrom pydantic import BaseModel\n\nclass RoomInvite(BaseModel):\n    room_id: str\n    websocket_path: str\n\n@app.post("/rooms", response_model=RoomInvite)\ndef create_room():\n    room_id = uuid4().hex\n    return {\n        "room_id": room_id,\n        "websocket_path": f"/ws/chat/{room_id}",\n    }`,
      },
      {
        title: "Pick a message type",
        body: "chat relays JSON objects for room conversations. video accepts WebRTC signaling objects named offer, answer, and candidate. json relays any JSON value on a fixed path. message relays plain text. byte relays binary frames. Chat/video use a room ID; JSON, message, and byte can use fixed paths without one.",
        code: `chat = WebSocketService(path="/ws/chat/{room_id}", type="chat")\nvideo = WebSocketService(path="/ws/video/{room_id}", type="video")\njson_feed = WebSocketService(path="/ws/json", type="json")\ntext_feed = WebSocketService(path="/ws/message", type="message")\nbytes_feed = WebSocketService(path="/ws/byte", type="byte")\n\n# Chat: {"type": "chat.message", "text": "Hi"}\n# Video signaling: {"type": "offer", "sdp": "..."}\n# JSON accepts any JSON value, including object, array, string, number, boolean, or null.`,
      },
      {
        title: "Use the room relay from an HTTP route",
        body: "A normal HTTP handler can publish to currently connected clients or disconnect everyone in a room. send() returns the number of clients that received the event. It does not queue messages for clients that connect later.",
        code: `@app.post("/rooms/{room_id}/announce")\nasync def announce(room_id: str, data: dict):\n    delivered = await chat.send(room_id, data)\n    return {"room_id": room_id, "delivered": delivered}\n\n@app.delete("/rooms/{room_id}/connections")\nasync def close_room(room_id: str):\n    disconnected = await chat.disconnect(room_id)\n    return {"room_id": room_id, "disconnected": disconnected}`,
        note: "Protect these HTTP routes with authentication and authorization too. WebSocket room operations are separate from ordinary HTTP route security.",
      },
      {
        title: "Set payload, heartbeat, and connection limits",
        body: "max_message_size is measured in bytes and applies to incoming and service.send payloads. heartbeat_seconds controls an idle ping/pong check; set it to None to disable the application heartbeat. max_connections limits a room, while max_total_connections limits all rooms managed by this process.",
        code: `chat = WebSocketService(\n    path="/ws/chat/{room_id}",\n    type="chat",\n    max_message_size=64_000,\n    max_connections=6,\n    max_total_connections=100,\n    heartbeat_seconds=30,\n)`,
        note: "The built-in video type caps rooms at two participants by default. Explicitly set max_connections to change that limit. Limits and heartbeat state are per worker because room membership is in local process memory.",
      },
      {
        title: "Connect a browser chat client",
        body: "Use ws:// on an HTTP page and wss:// on an HTTPS page. The service relays each message to every client currently connected to the same room, including the sender. Render incoming user content as text instead of inserting it as HTML.",
        code: `const roomId = new URLSearchParams(location.search).get("room");\nconst scheme = location.protocol === "https:" ? "wss:" : "ws:";\nconst socket = new WebSocket(scheme + "//" + location.host + "/ws/chat/" + roomId);\n\nsocket.addEventListener("open", () => console.log("connected"));\nsocket.addEventListener("message", (event) => {\n  const message = JSON.parse(event.data);\n  if (message.type === "lenapi.ping") {\n    socket.send(JSON.stringify({ type: "lenapi.pong" }));\n    return;\n  }\n  const item = document.createElement("li");\n  item.textContent = event.data;\n  document.querySelector("#messages").append(item);\n});\n\nfunction sendChat(text) {\n  if (socket.readyState === WebSocket.OPEN) {\n    socket.send(JSON.stringify({ type: "chat.message", text }));\n  }\n}\n// Call sendChat(input.value) from your submit button handler.`,
        note: "The browser WebSocket API cannot set arbitrary Authorization headers. For authenticated browser connections, use a secure cookie or a custom authenticator with a short-lived credential.",
      },
      {
        title: "Send JSON, text, and binary frames",
        body: "The service's type controls which WebSocket frame shapes are accepted. JSON clients send JSON.stringify(value), message clients send strings, and byte clients send ArrayBuffer or Blob values.",
        code: `// type="json"\nsocket.send(JSON.stringify({ event: "updated", count: 3 }));\n\n// type="message"\nsocket.send("plain text");\n\n// type="byte"\nsocket.send(new Uint8Array([1, 2, 3]).buffer);\nsocket.binaryType = "arraybuffer";\nsocket.addEventListener("message", (event) => {\n  if (event.data instanceof ArrayBuffer) {\n    console.log(new Uint8Array(event.data));\n  }\n});`,
      },
      {
        title: "Understand deployment boundaries",
        body: "Room membership and broadcasts live in process memory. Multiple workers or hosts cannot see each other's clients without shared pub/sub. Video mode relays only WebRTC offer/answer/candidate signaling; it does not carry camera or microphone media. Real calls need browser RTCPeerConnection code and ICE configuration; TURN is commonly needed across restrictive networks, and multi-party calls generally need an SFU.",
        note: "Video rooms allow two participants by default. Set max_connections if you need a different room cap. The in-memory room manager and connection counters are per process, not shared across workers.",
      },
      {
        title: "Use the low-level connection API when needed",
        body: "Use a low-level app.websocket handler when you need custom authorization, validation, room behavior, or message routing. Accept the handshake before sending data, then receive frames in a loop and catch WebSocketDisconnect for cleanup.",
        code: `from lenapi.service import WebSocket, WebSocketDisconnect\n\n@app.websocket("/ws/{room_id}")\nasync def socket(websocket: WebSocket, room_id: str):\n    await websocket.accept()\n    try:\n        while True:\n            message = await websocket.receive_json()\n            await websocket.send_json({"room_id": room_id, "echo": message})\n    except WebSocketDisconnect:\n        pass`,
        note: "The helper also has receive_text(), receive_bytes(), send_text(), send_bytes(), and close(code=...). WebSocket routes are not ordinary HTTP endpoints and are not shown as REST operations in Swagger.",
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
    tags: ["cache", "redis", "ttl", "database", "get", "set", "delete", "REDIS_URL", "CACHE_BACKEND", "python -m pip install lenapi redis", "memory"],
    steps: [
      {
        title: "Choose a backend",
        body: "Set CACHE_BACKEND to memory, database, or redis. This setting selects only app.cache. REDIS_URL is a connection string: redis://host:port/database-number. Memory is process-local and temporary; database and Redis are shared across app workers when configured to use the same backend.",
        code: `# settings.py\nREDIS_URL = "redis://127.0.0.1:6379/0"\nCACHE_BACKEND = "redis"  # memory, database, or redis`,
      },
      {
        title: "Set, read, and delete cache entries",
        body: "The current Cache service API is asynchronous. Values must be JSON serializable. TTL is specified in seconds.",
        code: `await app.cache.set("profile:42", {"name": "Ada"}, ttl=300)\nprofile = await app.cache.get("profile:42")\nawait app.cache.delete("profile:42")`,
      },
      {
        title: "Initialize persistent storage",
        body: "Database-backed cache uses the internal security-store table and is initialized by the migration command. Redis mode requires the Python redis extra and a separate reachable Redis server. Installing the extra does not install or start the Redis server.",
        code: `# For the database cache backend\npython lenora.py migration\n\n# Install the Redis client extra (quote brackets in zsh)\npython -m pip install 'lenapi[redis]'\n\n# Check a local Redis server\nredis-cli ping  # should print PONG`,
        note: "CACHE_BACKEND='redis' affects app.cache. For Redis-backed sessions, throttles, IP cooldowns, opaque bearer tokens, or HMAC nonce checks, also set SECURITY_STORAGE='redis'.",
      },
    ],
  },
  {
    id: "webhooks",
    group: "Realtime and services",
    title: "Webhooks: receiving and sending events",
    eyebrow: "GUIDE 16 · WEBHOOKS",
    summary: "Build webhook endpoints, choose provider signature verification, handle unsigned senders safely, and process retries without duplicate work.",
    readTime: "8 min",
    tags: ["webhook", "webhooks", "HMAC", "webhook_auth", "hmac_auth", "signature", "event_id", "idempotency", "retry", "Body", "BackgroundTasks", "API key", "bearer", "callback"],
    steps: [
      {
        title: "Start with a plain webhook endpoint",
        body: "A webhook is an HTTP request sent when an event happens. This is the smallest inbound webhook: it accepts any JSON event and returns it, with no signature or authentication check. LenAPI does not require HMAC; you can start with this route and add a verification option when your integration needs one.",
        code: `from typing import Any\nfrom lenapi import Body, LENAPI\n\napp = LENAPI()\n\n@app.post("/webhooks/events")\nasync def receive_event(payload: Any = Body()):\n    # Inspect or validate the event before processing it.\n    return {"received": True, "event": payload}`,
        note: "This route is intentionally unverified. Use it for local integration tests, trusted internal networks, or nonsensitive events. Before exposing it publicly or triggering sensitive actions, add a verification option below. HTTPS protects data in transit but does not authenticate the sender.",
      },
      {
        title: "Choose how to verify the sender when needed",
        body: "Providers retry webhook requests when delivery times out or receives an error. Verify the sender using the scheme it supports, validate each event, acknowledge promptly, and make processing idempotent.",
        list: [
          "Use a provider's native signature verification when it publishes a signing secret and signature format.",
          "Use LenAPI hmac_auth when both systems can share a secret and agree to LenAPI's timestamp, method, path, body-digest, and nonce format.",
          "If the provider cannot sign requests, require another credential such as a bearer token or a dedicated secret header, and add network restrictions and event deduplication where available.",
          "If a sender supports no signature or credential, keep the route behind a trusted gateway or limit it to non-sensitive actions.",
        ],
      },
      {
        title: "Verify a provider's raw-body HMAC signature",
        body: "Use webhook_auth when the sender signs the raw request body in the format supported by this helper. The dependency verifies the signature before your route acts. Configure the provider's header names exactly. If event_id_header and security_store are enabled, LenAPI records accepted event IDs and acknowledges duplicate deliveries with HTTP 200. A timestamp header is optional; when configured, the timestamp and raw body are signed together and checked for freshness.",
        code: `from typing import Any\nfrom lenapi import Body, Depends, LENAPI\nfrom lenapi.security import webhook_auth\nimport settings\n\napp = LENAPI()\nprovider_hook = webhook_auth(\n    settings.WEBHOOK_SECRET,  # configure this secret securely; use 32+ bytes\n    security_store=app.security_store,\n    provider="billing",\n    signature_header="x-webhook-signature",\n    event_id_header="x-webhook-id",\n    timestamp_header="x-webhook-timestamp",\n    tolerance_seconds=300,\n)\n\n@app.post("/webhooks/billing", auth=provider_hook)\nasync def receive_billing_event(\n    payload: Any = Body(),\n    verified=Depends(provider_hook),\n):\n    # Validate event type and required fields before changing data.\n    return {"received": True, "event_id": verified["event_id"]}`,
        note: "WebhookAuth verifies timestamp + '.' + the exact raw body when timestamp_header is configured; without a timestamp header, it verifies the exact raw body. This provider-style format is different from hmac_auth's canonical request signature. Follow the sending provider's documented format rather than changing its payload before verification.",
      },
      {
        title: "Use hmac_auth for a partner-defined request signature",
        body: "Use hmac_auth when your partner can sign each request using LenAPI's canonical format: timestamp, HTTP method, path and query, SHA-256 digest of the exact body, and unique nonce. This format binds the signature to the route and rejects stale timestamps and replayed nonces. The sender must use the same canonicalization and header names.",
        code: `from lenapi import Depends, LENAPI, Request\nfrom lenapi.security import hmac_auth\nimport settings\n\napp = LENAPI()\npartner_auth = hmac_auth(\n    settings.PARTNER_HMAC_SECRET,\n    tolerance_seconds=300,\n    nonce_store=app.security_store,\n    header_name="X-Partner-Signature",\n)\n\n@app.post("/webhooks/partner", auth=partner_auth)\nasync def receive_partner_event(\n    request: Request,\n    identity=Depends(partner_auth),\n):\n    payload = await request.json()  # can be any JSON shape\n    return {"accepted": True, "payload": payload}`,
        note: "Keep the secret out of source control. Database-backed security storage is the default; for multi-worker replay protection, use a shared database or configure SECURITY_STORAGE='redis'. Install the Redis client with python -m pip install 'lenapi[redis]' if you choose Redis.",
      },
      {
        title: "Accept a sender that does not support HMAC",
        body: "Some integrations provide only a static bearer token or secret header. Require and compare that credential in constant time, use HTTPS, and rotate the secret if it is exposed. A static key does not sign the payload, prove its freshness, or stop replay by itself. Use the provider's API-key or bearer option when it offers one; never treat an unguessable callback URL as authentication.",
        code: `import hmac\nfrom typing import Any\nfrom lenapi import Body, Depends, HTTPException, LENAPI, Request\nimport settings\n\napp = LENAPI()\nasync def verify_shared_secret(request: Request):\n    supplied = request.headers.get("x-provider-key", "")\n    expected = settings.PROVIDER_WEBHOOK_KEY\n    if not supplied or not hmac.compare_digest(supplied, expected):\n        raise HTTPException(401, "Invalid webhook credential")\n    return {"provider": "partner"}\n\n@app.post("/webhooks/unsigned-provider", auth=verify_shared_secret)\nasync def receive_unsigned_event(\n    payload: Any = Body(),\n    identity=Depends(verify_shared_secret),\n):\n    # Validate the schema and reject event IDs already processed.\n    return {"received": True, "provider": identity["provider"]}`,
        note: "If the sender supports no signature or credential at all, keep the endpoint read-only or put verification at a trusted gateway/network boundary. Do not process sensitive actions from an unauthenticated public callback.",
      },
      {
        title: "Send an event to another service",
        body: "For an outbound webhook, POST to the subscriber's configured endpoint and use a timeout. Include a stable event ID so the receiver can deduplicate retries. If the receiving service requires HMAC or an API key, send the credentials and signature format it documents; LenAPI does not force one scheme on outbound requests.",
        code: `import httpx\n\nasync def send_outbound_event(target_url: str, event_id: str, payload: dict):\n    async with httpx.AsyncClient(timeout=10) as client:\n        response = await client.post(\n            target_url,\n            json=payload,\n            headers={"Idempotency-Key": event_id},\n        )\n        response.raise_for_status()`,
        note: "Retry transient failures with bounded exponential backoff in a durable background job. Do not retry an event forever, and do not assume a receiver supports Idempotency-Key unless its documentation says so.",
      },
      {
        title: "Acknowledge quickly and handle retries safely",
        body: "Return a success response after the event is verified and safely accepted. For slow processing, queue an idempotent task instead of holding the provider connection open. Store provider event IDs with a unique constraint or use webhook_auth's security-store deduplication; retries must not repeat charges, emails, or other side effects.",
        code: `from lenapi import BackgroundTasks, Body, Depends\n\n@app.post("/webhooks/billing", auth=provider_hook)\nasync def billing_event(\n    background_tasks: BackgroundTasks,\n    payload: dict = Body(),\n    verified=Depends(provider_hook),\n):\n    background_tasks.add_task(\n        process_billing_event, verified["event_id"], payload\n    )\n    return {"received": True}`,
        note: "BackgroundTasks is in-process: a process crash can lose work. Use BackgroundQueue with the database or Redis backend when a job must survive restarts, and make the handler idempotent because durable queues provide at-least-once delivery.",
      },
    ],
  },
  {
    id: "background",
    group: "Realtime and services",
    title: "Background tasks and durable queues",
    eyebrow: "GUIDE 17 · BACKGROUND WORK",
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
        body: "BackgroundQueue supports database, Redis, and process-cache backends. Configure max_attempts and retry_delay when creating the queue: max_attempts is the total number of executions, and retry_delay is the base delay in seconds. Failed jobs wait retry_delay × attempt number before the next attempt. Pass delay_seconds to enqueue() to schedule the first attempt for later; it is not passed to the task function. Database and Redis jobs are delivered at least once, so task handlers should be idempotent.",
        code: `from lenapi import BackgroundQueue\n\nqueue = BackgroundQueue(\n    app.database,\n    max_attempts=3,\n    retry_delay=10,  # seconds between retries, multiplied by attempt number\n)\n\n@queue.task("send_welcome")\nasync def send_welcome(email: str):\n    ...\n\njob_id = await queue.enqueue(\n    "send_welcome",\n    "ada@example.com",\n    delay_seconds=300,  # run in five minutes\n)`,
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
    eyebrow: "GUIDE 18 · INTEGRATIONS",
    summary: "Call OpenAI or local Ollama models asynchronously and generate deterministic fake data for development.",
    readTime: "6 min",
    tags: ["openai", "ollama", "faker", "ai", "fake data", "seed"],
    steps: [
      {
        title: "Install optional integration dependencies",
        body: "Install the AI extra for the HTTP client. OpenAI reads its key from OPENAI_API_KEY by default. Ollama must be running at its base URL, and the requested model must already be pulled there.",
        code: `python -m pip install 'lenapi[ai]'\nexport OPENAI_API_KEY="your-openai-api-key"\nollama pull qwen3:0.6b`,
      },
      {
        title: "Call OpenAI asynchronously",
        body: "Use the Responses API through OpenAI.responses(). The client uses OPENAI_API_KEY from the environment unless you pass api_key directly. It returns the provider's JSON response; output_text contains the generated text when available.",
        code: `import os\nfrom lenapi import OpenAI\n\nasync def ask_openai():\n    async with OpenAI(\n        model="gpt-4.1-mini",\n        api_key=os.environ["OPENAI_API_KEY"],\n    ) as openai:\n        response = await openai.responses(\n            "Explain what an API is in one sentence."\n        )\n    return response.get("output_text", response)`,
        note: "You can omit api_key=... to let OpenAI read OPENAI_API_KEY itself. Keep the key in your environment or secret manager, never in source code or a public repository.",
      },
      {
        title: "Call Ollama asynchronously",
        body: "The Ollama wrapper defaults to the local server at http://127.0.0.1:11434. Set base_url to the URL of your own Ollama server when it is hosted elsewhere. The call is non-streaming and returns Ollama's JSON response.",
        code: `from lenapi import Ollama\n\nasync def ask_ollama():\n    async with Ollama(\n        model="qwen3:0.6b",\n        base_url="http://127.0.0.1:11434",\n    ) as ollama:\n        response = await ollama.chat([\n            {\n                "role": "user",\n                "content": "Explain what an API is in one sentence.",\n            }\n        ])\n    return response["message"]["content"]`,
        note: "Use the Ollama host URL only, such as http://127.0.0.1:11434. Do not add /api/chat; the LenAPI client appends that endpoint itself.",
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
    eyebrow: "GUIDE 19 · QUALITY",
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
    eyebrow: "GUIDE 20 · OPERATIONS",
    summary: "Configure the server, database, secrets, proxy boundary, and production process.",
    readTime: "6 min",
    tags: ["production", "uvicorn", "settings", "host", "port", "deployment", "secret", "docker", "postgresql", "redis", "sqlite", "cache"],
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
        body: "Install LenAPI from PyPI in the image; a Git client is not needed. Keep secrets and local database files out of the Docker build context, expose the same port that the server listens on, and persist SQLite data in a volume. Run checked-in migrations as a one-off release step before starting the app.",
        code: `# requirements.txt — install from PyPI
lenapi==0.1.4

# Dockerfile
FROM python:3.14-slim
WORKDIR /app
COPY requirements.txt .
RUN python -m pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8003
CMD ["python", "lenora.py", "run", "--host", "0.0.0.0", "--port", "8003", "--no-reload"]

# .dockerignore
.env
.env.*
.venv/
__pycache__/
*.db
*.sqlite*
.git/

docker build -t my-lenapi-app .`,
        note: "Use the Python version supported by your LenAPI release. Keep production secrets outside the image and provide them through your container platform. The next steps show SQLite/memory and PostgreSQL/Redis configurations.",
      },
      {
        title: "Deploy with SQLite and an in-memory cache",
        body: "This single-container option uses SQLite for application data and LenAPI's in-process memory cache. Attach a persistent volume at /data so records survive container replacement. Keep SECURITY_STORAGE on the database so sessions, rate-limit state, and related security records are persisted with SQL. The cache is process-local and clears when the container restarts; use one application worker for this configuration.",
        code: `# requirements.txt
lenapi==0.1.4

# settings.py
import os
from pathlib import Path

DATA_DIR = Path(os.getenv("LENAPI_DATA_DIR", "/data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
HOST = ""
PORT = int(os.getenv("LENAPI_PORT", "8003"))
DATABASE_TYPE = "sqlite"
DATABASE_URL = f"sqlite:///{DATA_DIR / 'lenapi.db'}"
ACTIVATE_ASYNC = True
CACHE_BACKEND = "memory"
SECURITY_STORAGE = "database"
SECRET_KEY = os.environ["LENAPI_SECRET_KEY"]

# Build, migrate once, and start the container.
docker build -t my-lenapi-app .
docker volume create lenapi-data
docker run --rm --env-file .env --mount source=lenapi-data,target=/data my-lenapi-app python lenora.py migrate
docker run -d --name my-lenapi-app --restart unless-stopped \\
  -p 8003:8003 --env-file .env \\
  --mount source=lenapi-data,target=/data my-lenapi-app`,
        note: "Set LENAPI_SECRET_KEY to a stable random value in .env, for example with python -c 'import secrets; print(secrets.token_urlsafe(48))'. Do not commit .env. The database volume is durable; the memory cache is not shared across replicas.",
      },
      {
        title: "Deploy with PostgreSQL and Redis",
        body: "Use PostgreSQL for application tables and LenAPI's database-backed security storage, and Redis for the cache. The app image needs the postgres and redis extras from PyPI. Compose starts the database and cache as private services, waits for their health checks, and publishes only the API port. Use a persistent PostgreSQL volume. Redis is configured as the cache here, not as the framework security store.",
        code: `# requirements.txt
lenapi[postgres,redis]==0.1.4

# settings.py
import os

HOST = ""
PORT = int(os.getenv("LENAPI_PORT", "8003"))
DATABASE_TYPE = "postgresql"
DATABASE_URL = os.environ["LENAPI_DATABASE_URL"]
ACTIVATE_ASYNC = True
CACHE_BACKEND = "redis"
REDIS_URL = os.environ["REDIS_URL"]
SECURITY_STORAGE = "database"
SECRET_KEY = os.environ["LENAPI_SECRET_KEY"]

# compose.yaml
services:
  app:
    build: .
    ports: ["8003:8003"]
    env_file: .env
    environment:
      LENAPI_DATABASE_URL: postgresql+psycopg://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/\${POSTGRES_DB}
      REDIS_URL: redis://redis:6379/0
      LENAPI_PORT: "8003"
    depends_on:
      db: {condition: service_healthy}
      redis: {condition: service_healthy}
    restart: unless-stopped
  db:
    image: postgres:17-alpine
    env_file: .env
    volumes: ["postgres-data:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER} -d \${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 10
  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10
volumes:
  postgres-data:

# .env — keep out of Git and the Docker build context
POSTGRES_DB=lenapi
POSTGRES_USER=lenapi
POSTGRES_PASSWORD=replace-with-a-long-random-password
LENAPI_SECRET_KEY=replace-with-a-long-random-signing-key

# Apply reviewed migrations, then start services.
docker compose build
docker compose run --rm app python lenora.py migrate
docker compose up -d`,
        note: "Inside the container, db is the PostgreSQL hostname and redis is the Redis hostname; localhost would refer back to the app container. Keep SECURITY_STORAGE='database' when security state should stay in PostgreSQL. Set it to 'redis' only if you intentionally want shared security state in Redis.",
      },
      {
        title: "Deploy from Coolify",
        body: "Create an application from the Git repository, select the Dockerfile build pack, and point Coolify at the directory containing the app Dockerfile. Set the container port to match EXPOSE, add secrets through Coolify environment variables, attach persistent storage if using SQLite, and configure the HTTPS domain. Run migrations once as a deployment or release step before serving traffic.",
        code: `# Coolify application settings
Build pack: Dockerfile
Dockerfile: ./Dockerfile
Container port: 8003
Start command: use the Dockerfile CMD

# Example Coolify environment variables for PostgreSQL + Redis:
LENAPI_DATABASE_TYPE=postgresql
LENAPI_DATABASE_URL=postgresql+psycopg://user:password@postgres-host:5432/app
CACHE_BACKEND=redis
REDIS_URL=redis://redis-host:6379/0
SECURITY_STORAGE=database
LENAPI_SECRET_KEY=<generated-secret>

# Release step: apply reviewed, checked-in revisions only
python lenora.py migrate`,
        note: "Do not commit production .env files or database files. Configure Coolify build context and Dockerfile path for the application directory. Add PostgreSQL and Redis as reachable services, configure persistent database storage, and do not expose Redis publicly.",
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
