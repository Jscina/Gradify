use sqlx::SqlitePool;

pub struct Database {
    pub pool: SqlitePool,
}

impl Database {
    pub async fn new(url: &str) -> Self {
        let pool = SqlitePool::connect(url).await.expect("Can't connect to db");
        sqlx::migrate!("./migrations")
            .run(&pool)
            .await
            .expect("Can't run migrations");
        Self { pool }
    }
}
