from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
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
    admin: "Author" = Relationship(back_populates="admin_groups")
    authors: List["Author"] = Relationship(back_populates="groups")
    stories: List["Story"] = Relationship(back_populates="group")


class Post(SQLModel, table=True):
    id: Union[int, None] = Field(default=None, primary_key=True)
    text: str
    date_unixtime: int
    story: "Story" = Relationship(back_populates="posts")
    author: "Author" = Relationship(back_populates="posts")


class Story(SQLModel, table=True):
    id: Union[int, None] = Field(default=None, primary_key=True)
    title: str
    isDone: bool = Field(default=False)
    posts: List["Post"] = Relationship(back_populates="story")
    group: "Group" = Relationship(back_populates="stories")


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


@app.post("/stories/")
async def create_story(story: Story, session: SessionDep):
    story.id = random.randint(1000, 999999)
    session.add(story)
    session.commit()
    session.refresh(story)
    return story


@app.get("/get_story/{story_id}")
async def create_story(story_id: int, session: SessionDep):
    story = session.get(Story, story_id)
    return story
=======
@app.post("/entries/")
async def create_item():

    return "hi!"
