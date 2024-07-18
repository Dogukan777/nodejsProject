#ATEZ STAJ 2024 E-commerce App

User management => /login , /signup
verifyAuth => jwt token authentication

- USER DB QUERY

```sh
create table if not exists atezstaj.users
(
    id       int auto_increment
        primary key,
    email    varchar(100) not null,
    password varchar(250) null,
    username varchar(100) null,
    name     varchar(50)  null,
    surname  varchar(50)  null
);
```