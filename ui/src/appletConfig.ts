import { AppletConfigInput, ConfigCulturalContext, ConfigMethod, ConfigResourceType, ConfigThreshold, Dimension, Range } from '@neighbourhoods/sensemaker-lite-types'

// This is the applet config for the todo applet, but provides an outline of how to create your own applet config
const importanceRange: Range = {
    "name": "1-scale",
    "kind": {
        "Integer": { "min": 0, "max": 1 }
    }
}
const importanceDimension: Dimension = {
    "name": "importance",
    "range": importanceRange,
    "computed": false
}

const totalImportanceRange: Range = {
    "name": "1-scale-total",
    "kind": {
        "Integer": { "min": 0, "max": 1000000 }
    }
}
const totalImportanceDimension = {
    "name": "total_importance",
    "range": totalImportanceRange,
    "computed": true
}

const taskItemResourceType: ConfigResourceType = {
    "name": "task_item",
    "base_types": [{ "entry_index": 0, "zome_index": 0, "visibility": { "Public": null } }],
    "dimensions": [importanceDimension]
}

const totalImportanceMethod: ConfigMethod = {
    "name": "total_importance_method",
    "target_resource_type": taskItemResourceType,
    "input_dimensions": [importanceDimension],
    "output_dimension": totalImportanceDimension,
    "program": { "Sum": null },
    "can_compute_live": false,
    "must_publish_dataset": false
}

const importanceThreshold: ConfigThreshold = {
    "dimension": totalImportanceDimension,
    "kind": { "GreaterThan": null },
    "value": { "Integer": 0 }
}
const mostImportantTasksContext: ConfigCulturalContext = {
    "name": "most_important_tasks",
    "resource_type": taskItemResourceType,
    "thresholds": [importanceThreshold],
    "order_by": [[totalImportanceDimension, { "Biggest": null }]]
}
const appletConfig: AppletConfigInput = {
    "name": "provider_applet",
    "dimensions": [importanceDimension, totalImportanceDimension],
    "resource_types": [taskItemResourceType],
    "methods": [totalImportanceMethod],
    "cultural_contexts": [mostImportantTasksContext]
}

export default appletConfig