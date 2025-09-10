from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlmodel import Field, SQLModel, create_engine, Session, Relationship
from typing import Annotated, Union, List, Optional
import random


class Author(SQLModel, table=True):
    id: Union[int, None] = Field(default=None, primary_key=True)
    email: str
    password: str
    name: str
    posts: List["Post"] = Relationship(back_populates="author")
    groups: List["Group"] = Relationship(back_populates="authors")
    admin_groups: List["Group"] = Relationship(back_populates="admin")


class Group(SQLModel, table=True):
    id: Union[int, None] = Field(default=None, primary_key=True)
    name: str
    admin_id: Optional[int] = Field(default=None, foreign_key="author.id")
    admin: Optional["Author"] = Relationship(back_populates="admin_groups")
    authors: List["Author"] = Relationship(back_populates="groups")
    stories: List["Story"] = Relationship(back_populates="group")


class Post(SQLModel, table=True):
    id: Union[int, None] = Field(default=None, primary_key=True)
    text: str
    date_unixtime: int
    story_id: Optional[int] = Field(default=None, foreign_key="story.id")
    story: Optional["Story"] = Relationship(back_populates="posts")
    author_id: Optional[int] = Field(default=None, foreign_key="author.id")
    author: Optional["Author"] = Relationship(back_populates="posts")


class Story(SQLModel, table=True):
    id: Union[int, None] = Field(default=None, primary_key=True)
    title: str
    isDone: bool = Field(default=False)
    group_id: Optional[int] = Field(default=None, foreign_key="group.id")
    posts: List["Post"] = Relationship(back_populates="story")
    group: Optional["Group"] = Relationship(back_populates="stories")


sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="."), name="static")


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/test")
async def test_page():
    return FileResponse("simple_test.html")


@app.get("/forms")
async def forms_page():
    return FileResponse("test_forms.html")


@app.post("/create_story/")
async def create_story(story: Story, session: SessionDep):
    story.id = random.randint(1000, 999999)
    session.add(story)
    session.commit()
    session.refresh(story)
    return story


@app.get("/get_story/{story_id}")
async def get_story(story_id: int, session: SessionDep):
    story = session.get(Story, story_id)
    return story


# Get all data endpoints
@app.get("/authors/")
async def get_all_authors(session: SessionDep):
    from sqlmodel import select

    statement = select(Author)
    authors = session.exec(statement).all()
    return authors


@app.get("/groups/")
async def get_all_groups(session: SessionDep):
    from sqlmodel import select

    statement = select(Group)
    groups = session.exec(statement).all()
    return groups


@app.get("/stories/")
async def get_all_stories(session: SessionDep):
    from sqlmodel import select

    statement = select(Story)
    stories = session.exec(statement).all()
    return stories


@app.get("/posts/")
async def get_all_posts(session: SessionDep):
    from sqlmodel import select

    statement = select(Post)
    posts = session.exec(statement).all()
    return posts


@app.post("/create_author/")
async def create_author(author: Author, session: SessionDep):
    author.id = random.randint(1000, 999999)
    session.add(author)
    session.commit()
    session.refresh(author)
    return author


@app.post("/create_post/")
async def create_post(post: Post, session: SessionDep):
    post.id = random.randint(1000, 999999)
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@app.post("/create_group/")
async def create_group(group: Group, session: SessionDep):
    group.id = random.randint(1000, 999999)
    session.add(group)
    session.commit()
    session.refresh(group)
    return group
