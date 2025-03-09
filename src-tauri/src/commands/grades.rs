use crate::{database::models::Grade, AppState};
use tauri::State;
use tokio::sync::Mutex;

#[tauri::command(async, rename_all = "snake_case")]
pub async fn create_grade(
    state: State<'_, Mutex<AppState>>,
    student_id: i64,
    assignment_id: i64,
    score: f64,
) -> Result<Grade, String> {
    let state = state.lock().await;
    let grade = sqlx::query_as::<_, Grade>(
        "INSERT INTO GRADES (STUDENT_ID, ASSIGNMENT_ID, SCORE)
         VALUES (?, ?, ?)
         RETURNING STUDENT_ID, ASSIGNMENT_ID, SCORE",
    )
    .bind(student_id)
    .bind(assignment_id)
    .bind(score)
    .fetch_one(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(grade)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn get_grade(
    state: State<'_, Mutex<AppState>>,
    student_id: i64,
    assignment_id: i64,
) -> Result<Grade, String> {
    let state = state.lock().await;
    let grade = sqlx::query_as::<_, Grade>(
        "SELECT STUDENT_ID, ASSIGNMENT_ID, SCORE FROM GRADES
         WHERE STUDENT_ID = ? AND ASSIGNMENT_ID = ?",
    )
    .bind(student_id)
    .bind(assignment_id)
    .fetch_one(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(grade)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn get_all_grades(state: State<'_, Mutex<AppState>>) -> Result<Vec<Grade>, String> {
    let state = state.lock().await;
    let grades = sqlx::query_as::<_, Grade>("SELECT STUDENT_ID, ASSIGNMENT_ID, SCORE FROM GRADES")
        .fetch_all(&state.db.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(grades)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn update_grade(
    state: State<'_, Mutex<AppState>>,
    student_id: i64,
    assignment_id: i64,
    score: f64,
) -> Result<Grade, String> {
    let state = state.lock().await;
    let grade = sqlx::query_as::<_, Grade>(
        "UPDATE GRADES 
         SET SCORE = ? 
         WHERE STUDENT_ID = ? AND ASSIGNMENT_ID = ?
         RETURNING STUDENT_ID, ASSIGNMENT_ID, SCORE",
    )
    .bind(score)
    .bind(student_id)
    .bind(assignment_id)
    .fetch_one(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(grade)
}

#[tauri::command(async, rename_all = "snake_case")]
pub async fn delete_grade(
    state: State<'_, Mutex<AppState>>,
    student_id: i64,
    assignment_id: i64,
) -> Result<(), String> {
    let state = state.lock().await;
    sqlx::query(
        "DELETE FROM GRADES
         WHERE STUDENT_ID = ? AND ASSIGNMENT_ID = ?",
    )
    .bind(student_id)
    .bind(assignment_id)
    .execute(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}
