import { ActionHash, EntryHash } from "@holochain/client"
import { Assessment } from "@neighbourhoods/sensemaker-lite-types"

// NOTE: these are only example type definitions, you will need to define your own types to match the types defined in your zome code
interface Task {
    description: string,
    status: TaskStatus,
}


type TaskStatus = TaskStatusComplete | TaskStatusIncomplete

interface TaskStatusComplete {
    Complete: null,
}

interface TaskStatusIncomplete {
    Incomplete: null,
}

interface TaskToListInput {
    task_description: string,
    list: string,
}

interface WrappedEntry<T> {
    action_hash: ActionHash,
    entry_hash: EntryHash,
    entry: T,
}
type WrappedTaskWithAssessment = WrappedEntry<Task> & {
    assessments: Assessment | undefined,
}

export {
    Task,
    TaskStatus,
    TaskStatusComplete,
    TaskStatusIncomplete,
    TaskToListInput,
    WrappedEntry,
    WrappedTaskWithAssessment,
}

export interface AppletConfig {
    dimensions: {
        [dimensionName: string]: EntryHash,
    },
    methods: {
        [methodName: string]: EntryHash,
    },
    contexts: {
        [contextName: string]: EntryHash,
    },
    contextResults: {
        [contextName: string]: Array<WrappedTaskWithAssessment>,
    }
}