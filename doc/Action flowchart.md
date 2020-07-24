# Action flowchart

The action runs according to the following flowchart.

```mermaid
graph TB
    START(Start)
    END(End)

    %% Input/Output
    IO_READ_GITHUB_ACCESS_TOKEN[/Read GitHub access token/]
    IO_DOWNLOAD_LICENSE_FROM_MASTER[/Download license from master/]
    IO_DOWNLOAD_LICENSE_FROM_BRANCH[/Download license from branch/]
    IO_UPLOAD_LICENSE_TO_BRANCH[/Upload license to branch/]
    IO_CREATE_BRANCH[/Create branch/]
    IO_CREATE_PR[/Create PR/]
    IO_ADD_ASSIGNEES[/Add assignees/]
    IO_ADD_LABELS[/Add labels/]

    %% Decision
    D_BRANCH_EXISTS_1{Branch exist?}
    D_BRANCH_EXISTS_2{Branch exist?}
    D_LICENSE_CHANGED{License changed?}
    D_PR_EXISTS{PR exists?}
    D_CONFIG_ASSIGNEES{Assignees?}
    D_CONFIG_LABELS{Labels?}

    %% Process
    P_UPDATE_LICENSE[Update license]

    %% Workflow definition
    START --> IO_READ_GITHUB_ACCESS_TOKEN --> D_BRANCH_EXISTS_1
    D_BRANCH_EXISTS_1 --No--> IO_DOWNLOAD_LICENSE_FROM_MASTER --> P_UPDATE_LICENSE
    D_BRANCH_EXISTS_1 --Yes--> IO_DOWNLOAD_LICENSE_FROM_BRANCH --> P_UPDATE_LICENSE
    P_UPDATE_LICENSE --> D_LICENSE_CHANGED
    D_LICENSE_CHANGED --No--> END
    D_LICENSE_CHANGED --Yes--> D_BRANCH_EXISTS_2
    D_BRANCH_EXISTS_2 --No--> IO_CREATE_BRANCH --> IO_UPLOAD_LICENSE_TO_BRANCH
    D_BRANCH_EXISTS_2 --Yes--> IO_UPLOAD_LICENSE_TO_BRANCH
    IO_UPLOAD_LICENSE_TO_BRANCH --> D_PR_EXISTS
    D_PR_EXISTS --Yes--> END
    D_PR_EXISTS --No--> IO_CREATE_PR
    IO_CREATE_PR --> D_CONFIG_ASSIGNEES
    D_CONFIG_ASSIGNEES --No--> D_CONFIG_LABELS
    D_CONFIG_ASSIGNEES --Yes--> IO_ADD_ASSIGNEES --> D_CONFIG_LABELS
    D_CONFIG_LABELS --No--> END
    D_CONFIG_LABELS --Yes--> IO_ADD_LABELS --> END
```
