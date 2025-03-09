use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Student {
    pub id: i64,
    pub first_name: String,
    pub last_name: String,
    pub email: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Class {
    pub id: i64,
    pub class_name: String,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct StudentClass {
    pub student_id: i64,
    pub class_id: i64,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Assignment {
    pub id: i64,
    pub class_id: i64,
    pub assignment_name: String,
    pub assignment_type: String,
    pub maximum_score: f64,
    pub due_date: Option<NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Grade {
    pub student_id: i64,
    pub assignment_id: i64,
    pub score: f64,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct OverallGrade {
    pub student_id: i64,
    pub class_id: i64,
    pub percentage: f64,
    pub letter_grade: String,
}
