import { Task, WrappedEntry, WrappedTaskWithAssessment } from "./types";
import { encodeHashToBase64 } from '@holochain/client'
import { Assessment } from "@neighbourhoods/sensemaker-lite-types";

function addMyAssessmentsToTasks(myPubKey: string, tasks: WrappedEntry<Task>[], assessments: Record<string, Array<Assessment>>): WrappedTaskWithAssessment[] {
    const tasksWithMyAssessments = tasks.map(task => {
      const assessmentsForTask = assessments[encodeHashToBase64(task.entry_hash)]
      let myAssessment
      if (assessmentsForTask) {
        myAssessment = assessmentsForTask.find(assessment => encodeHashToBase64(assessment.author) === myPubKey)
      }
      else {
        myAssessment = undefined
      }
      return {
        ...task,
        assessments: myAssessment,
      }
    })
    return tasksWithMyAssessments
  }

  export { addMyAssessmentsToTasks }
