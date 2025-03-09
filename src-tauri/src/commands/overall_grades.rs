use crate::{database::models::OverallGrade, AppState};
use tauri::State;
use tokio::sync::Mutex;

#[tauri::command(async, rename_all = "snake_case")]
pub async fn get_overall_grades(
    state: State<'_, Mutex<AppState>>,
) -> Result<Vec<OverallGrade>, String> {
    let state = state.lock().await;
    let overall_grades = sqlx::query_as::<_, OverallGrade>(
        "SELECT STUDENT_ID, CLASS_ID, PERCENTAGE, LETTER_GRADE FROM OVERALL_GRADES",
    )
    .fetch_all(&state.db.pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(overall_grades)
}
