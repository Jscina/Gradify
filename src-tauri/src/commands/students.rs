use crate::{database::models::Student, AppState};
use tauri::State;
use tokio::sync::Mutex;

#[tauri::command(async, rename_all = "snake_case")]
pub async fn create_student(
    state: State<'_, Mutex<AppState>>,
    first_name: String,
    last_name: String,
    email: Option<String>,
) -> Result<Student, String> {
    let state = state.lock().await;

    let result = sqlx::query(
        "INSERT INTO STUDENTS (FIRST_NAME, LAST_NAME, EMAIL)
         VALUES (?, ?, ?)",
    )
    .bind(first_name.clone())
    .bind(last_name.clone())
    .bind(&email)
    .execute(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;

    let id = result.last_insert_rowid();

    let student = sqlx::query_as::<_, Student>(
        "SELECT ID, FIRST_NAME, LAST_NAME, EMAIL FROM STUDENTS WHERE ID = ?",
    )
    .bind(id)
    .fetch_one(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(student)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn get_student(state: State<'_, Mutex<AppState>>, id: i64) -> Result<Student, String> {
    let state = state.lock().await;
    let student = sqlx::query_as::<_, Student>(
        "SELECT ID, FIRST_NAME, LAST_NAME, EMAIL FROM STUDENTS WHERE ID = ?",
    )
    .bind(id)
    .fetch_one(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(student)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn get_all_students(state: State<'_, Mutex<AppState>>) -> Result<Vec<Student>, String> {
    let state = state.lock().await;
    let students =
        sqlx::query_as::<_, Student>("SELECT ID, FIRST_NAME, LAST_NAME, EMAIL FROM STUDENTS")
            .fetch_all(&state.db.pool)
            .await
            .map_err(|e| e.to_string())?;

    Ok(students)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn update_student(
    state: State<'_, Mutex<AppState>>,
    id: i64,
    first_name: String,
    last_name: String,
    email: Option<String>,
) -> Result<Student, String> {
    let state = state.lock().await;

    sqlx::query(
        "UPDATE STUDENTS
         SET FIRST_NAME = ?, LAST_NAME = ?, EMAIL = ?
         WHERE ID = ?",
    )
    .bind(&first_name)
    .bind(&last_name)
    .bind(&email)
    .bind(id)
    .execute(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;

    let student = sqlx::query_as::<_, Student>(
        "SELECT ID, FIRST_NAME, LAST_NAME, EMAIL FROM STUDENTS WHERE ID = ?",
    )
    .bind(id)
    .fetch_one(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(student)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn delete_student(state: State<'_, Mutex<AppState>>, id: i64) -> Result<(), String> {
    let state = state.lock().await;
    sqlx::query("DELETE FROM STUDENTS WHERE ID = ?")
        .bind(id)
        .execute(&state.db.pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
