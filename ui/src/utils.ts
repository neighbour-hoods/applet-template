import { Task, WrappedEntry, WrappedTaskWithAssessment } from "./types";
import {
    Dictionary,
  } from '@holochain-open-dev/core-types';
import { Assessment } from "@neighbourhoods/sensemaker-lite-types";
import { serializeHash } from "@holochain-open-dev/utils";

function addMyAssessmentsToTasks(myPubKey: string, tasks: WrappedEntry<Task>[], assessments: Dictionary<Array<Assessment>>): WrappedTaskWithAssessment[] {
    const tasksWithMyAssessments = tasks.map(task => {
      const assessmentsForTask = assessments[serializeHash(task.entry_hash)]
      let myAssessment
      if (assessmentsForTask) {
        myAssessment = assessmentsForTask.find(assessment => serializeHash(assessment.author) === myPubKey)
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