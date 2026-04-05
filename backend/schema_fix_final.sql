-- Final Fix schema drift for Kanban Board (Standard SQL)
USE kanban_db;

-- 1. Create ChecklistItems
CREATE TABLE IF NOT EXISTS ChecklistItems (
    Id char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL PRIMARY KEY,
    TaskId char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
    Title varchar(200) NOT NULL,
    IsCompleted tinyint(1) NOT NULL DEFAULT 0,
    SortOrder int NOT NULL DEFAULT 0,
    CONSTRAINT FK_ChecklistItems_Tasks_TaskId FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

-- 2. Create KanbanTaskLabel (Join table)
CREATE TABLE IF NOT EXISTS KanbanTaskLabel (
    LabelsId char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
    TasksId char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
    PRIMARY KEY (LabelsId, TasksId),
    CONSTRAINT FK_KanbanTaskLabel_Labels_LabelsId FOREIGN KEY (LabelsId) REFERENCES Labels(Id) ON DELETE CASCADE,
    CONSTRAINT FK_KanbanTaskLabel_Tasks_TasksId FOREIGN KEY (TasksId) REFERENCES Tasks(Id) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

-- 3. Finalize Tasks (Run individually, use mysql -f to ignore errors)
ALTER TABLE Tasks ADD COLUMN SortOrder double NOT NULL DEFAULT 0.0;
ALTER TABLE Tasks ADD COLUMN CreatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);
ALTER TABLE Tasks ADD COLUMN UpdatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);
ALTER TABLE Tasks MODIFY COLUMN BoardId char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL;
ALTER TABLE Tasks ADD CONSTRAINT FK_Tasks_Boards_BoardId FOREIGN KEY (BoardId) REFERENCES Boards(Id) ON DELETE CASCADE;
