// Global variables
let currentWeek = 1;
let generatedTimetable = [];

// --- Class Definitions ---
class Lab {
  constructor(name, capacity, isCombined) {
    this.name = name;
    this.capacity = capacity;
    this.isCombined = isCombined;
    this.schedule = new Map(); // Map<timeSlot, groups[]>
  }
  isAvailable(timeSlot) {
    return !this.schedule.has(timeSlot);
  }
  canAccommodate(groups) {
    return this.isCombined && groups.length <= this.capacity;
  }
  assignGroup(timeSlot, groups) {
    if (!this.schedule.has(timeSlot)) {
      this.schedule.set(timeSlot, []);
    }
    this.schedule.get(timeSlot).push(...groups);
  }
}

class Section {
  constructor(name, groups, slotsPerDay, numDays) {
    this.name = name;
    this.groups = groups;
    this.slotsPerDay = slotsPerDay;
    this.numDays = numDays;
    this.groupAssignments = {
      G1: Array(numDays * slotsPerDay).fill(null),
      G2: Array(numDays * slotsPerDay).fill(null)
    };
    this.lectureAssignments = Array(numDays * slotsPerDay).fill(null);
    this.timeSlots = [];
    this.batch = "";
  }
  assignLabToGroup(group, lab, slotIndex) {
    this.groupAssignments[group][slotIndex] = lab;
  }
  assignLecture(subject, slotIndex) {
    this.lectureAssignments[slotIndex] = subject;
  }
}

// DOM Event Listeners
document.getElementById("timetableForm").addEventListener("submit", function (event) {
    event.preventDefault();
    generateTimetable();
});

document.getElementById("resetButton").addEventListener("click", function () {
    document.getElementById("timetableBody").innerHTML = "";
    document.getElementById("timetableResult").classList.add("hidden");
    document.getElementById("exportCSV").classList.add("hidden");
    document.getElementById("subjectInputs").innerHTML = "";
    document.getElementById("labInputs").innerHTML = "";
    document.getElementById("subjectNamesContainer").classList.add("hidden");
    document.getElementById("labNamesContainer").classList.add("hidden");
    currentWeek = 1;
});

document.getElementById("numSubjects").addEventListener("change", setupSubjectInputs);
document.getElementById("numLabs").addEventListener("change", setupSubjectInputs);
document.getElementById("exportCSV").addEventListener("click", exportAsCSV);

// --- Main Timetable Generation ---
function generateTimetable() {
  currentWeek = 1;
  generatedTimetable = [];

  // Get input values
  const sectionRange = document.getElementById("sectionRange").value.toUpperCase().split("-");
  const numSubjects = parseInt(document.getElementById("numSubjects").value);
  const numLabs = parseInt(document.getElementById("numLabs").value);
  const groupsPerSection = parseInt(document.getElementById("groupsPerSection").value);
  const combinedLabsInput = document.getElementById("combinedLabs").value;
  const combinedLabs = combinedLabsInput ? combinedLabsInput.split(',').map(lab => lab.trim()).filter(lab => lab) : [];
  const minLecturesPerDay = parseInt(document.getElementById("minClassesPerDay").value);
  const maxLabsPerDay = parseInt(document.getElementById("maxLabsPerDay").value);

  // Time-related inputs
  const morningStart = convertToMinutes(document.getElementById("morningStart")?.value || "09:00");
  const eveningStart = convertToMinutes(document.getElementById("eveningStart")?.value || "14:00");
  const classDuration = parseInt(document.getElementById("classDuration")?.value) || 60;
  const labDuration = parseInt(document.getElementById("labDuration")?.value) || 120;
  const gapBetweenClasses = parseInt(document.getElementById("gapBetweenClasses")?.value) || 0;

  // Days and holidays
  let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let holidays = Array.from(document.querySelectorAll('input[name="holiday"]:checked')).map(cb => cb.value);
  let workingDays = days.filter(day => !holidays.includes(day));
  let numLabDays = workingDays.length;

  // Generate sections from range
  let sectionsArr = [];
  if (sectionRange.length === 2 && sectionRange[0] && sectionRange[1]) {
    let startChar = sectionRange[0].charCodeAt(0);
    let endChar = sectionRange[1].charCodeAt(0);
    if (startChar > endChar) {
      showError("Invalid section range.");
      return;
    }
    for (let i = startChar; i <= endChar; i++) {
      sectionsArr.push(String.fromCharCode(i));
    }
  } else {
    showError("Invalid section range.");
    return;
  }

  // Subjects and Labs
  let subjects = [];
  for (let i = 1; i <= numSubjects; i++) {
    const subjectInput = document.getElementById(`subjectName${i}`);
    subjects.push(subjectInput ? subjectInput.value || `Subject ${i}` : `Subject ${i}`);
  }
  let labs = [];
  for (let i = 1; i <= numLabs; i++) {
    const labInput = document.getElementById(`labName${i}`);
    const labName = labInput ? labInput.value || `Lab ${i}` : `Lab ${i}`;
    const isCombined = combinedLabs.some(
      cl => cl.trim().toLowerCase() === labName.trim().toLowerCase()
    );
    labs.push(new Lab(labName, isCombined ? 2 : 1, isCombined));
  }

  // Prepare sections
  let sections = [];
  sectionsArr.forEach(sectionName => {
    sections.push(new Section(sectionName, groupsPerSection, maxLabsPerDay, numLabDays));
  });

  // Assign batches and generate time slots per section
  let batches = ["Morning", "Evening"];
  sections.forEach((section, idx) => {
    section.batch = batches[idx % batches.length];
    section.timeSlots = [];
    for (let d = 0; d < numLabDays; d++) {
      let day = workingDays[d];
      let time = section.batch === "Evening" ? eveningStart : morningStart;
      const endTime = convertToMinutes(document.getElementById("collegeEnd").value || "17:00");

      let lecturesLeft = minLecturesPerDay;
      let labsLeft = maxLabsPerDay;

      // Alternate: LECTURE, LAB, LECTURE, LAB... until all required are scheduled or time runs out
      while ((lecturesLeft > 0 || labsLeft > 0) && time < endTime) {
        if (labsLeft > 0) {
          // Schedule a lab
          if (time + labDuration <= endTime) {
            section.timeSlots.push({
              type: "lab",
              label: `${day} ${formatTime(time)} - ${formatTime(time + labDuration)}`
            });
            time += labDuration + gapBetweenClasses;
            labsLeft--;
          } else {
            break;
          }
        }
        if (lecturesLeft > 0 && time < endTime) {
          // Schedule a lecture
          if (time + classDuration <= endTime) {
            section.timeSlots.push({
              type: "lecture",
              label: `${day} ${formatTime(time)} - ${formatTime(time + classDuration)}`
            });
            time += classDuration + gapBetweenClasses;
            lecturesLeft--;
          } else {
            break;
          }
        }
      }
    }
  });

  // Assign labs and lectures (per section, using section.timeSlots)
  sections.forEach(section => {
    assignLabsAndLectures([section], labs, subjects, section.timeSlots, combinedLabs, minLecturesPerDay, maxLabsPerDay, numLabDays);
  });

  // Build timetable array for display
  let timetable = [];
  sections.forEach(section => {
    for (let slotIndex = 0; slotIndex < section.timeSlots.length; slotIndex++) {
      let timeSlot = section.timeSlots[slotIndex];
      let [day, ...timeArr] = timeSlot.label.split(" ");
      let timeRange = timeArr.join(" ");
      // Labs
      if (groupsPerSection === 2) {
        let labG1 = section.groupAssignments.G1[slotIndex];
        let labG2 = section.groupAssignments.G2[slotIndex];
        if (labG1 && labG2 && labG1 === labG2) {
          timetable.push({
            section: section.name,
            batch: section.batch,
            day: day,
            timeSlot: timeRange,
            subject: labG1,
            isLab: true,
            isCombinedLab: true,
            group: "All",
            type: "Combined Lab"
          });
        } else {
          if (labG1) {
            timetable.push({
              section: section.name,
              batch: section.batch,
              day: day,
              timeSlot: timeRange,
              subject: labG1,
              isLab: true,
              isCombinedLab: false,
              group: 1,
              type: "Lab (G1)"
            });
          }
          if (labG2) {
            timetable.push({
              section: section.name,
              batch: section.batch,
              day: day,
              timeSlot: timeRange,
              subject: labG2,
              isLab: true,
              isCombinedLab: false,
              group: 2,
              type: "Lab (G2)"
            });
          }
        }
      } else {
        let labG1 = section.groupAssignments.G1[slotIndex];
        if (labG1) {
          timetable.push({
            section: section.name,
            batch: section.batch,
            day: day,
            timeSlot: timeRange,
            subject: labG1,
            isLab: true,
            isCombinedLab: combinedLabs.some(
              cl => cl.trim().toLowerCase() === labG1.trim().toLowerCase()
            ),
            group: null,
            type: combinedLabs.some(
              cl => cl.trim().toLowerCase() === labG1.trim().toLowerCase()
            ) ? "Combined Lab" : "Lab"
          });
        }
      }
      // Lectures (always assigned)
      let lecture = section.lectureAssignments[slotIndex];
      if (lecture) {
        timetable.push({
          section: section.name,
          batch: section.batch,
          day: day,
          timeSlot: timeRange,
          subject: lecture,
          isLab: false,
          isCombinedLab: false,
          group: null,
          type: "Lecture"
        });
      }
    }
  });

  generatedTimetable = timetable;
  displayTimetable(timetable);
  document.getElementById("exportCSV").classList.remove("hidden");
}

// --- Assign Labs and Lectures ---
// Ensures all labs are assigned to both groups (not at the same time), and combined labs are distributed
// Also ensures a lecture is always assigned to every slot, so all subjects are distributed
function assignLabsAndLectures(sections, labs, subjects, timeSlots, combinedLabs, minLecturesPerDay, maxLabsPerDay, numLabDays) {
  sections.forEach(section => {
    let combinedLabsList = labs.filter(lab => lab.isCombined);
    let nonCombinedLabsList = labs.filter(lab => !lab.isCombined);

    // Prepare round-robin queues for each group (so every group gets every lab)
    let g1Queue = [...nonCombinedLabsList];
    let g2Queue = [...nonCombinedLabsList];

    // Shuffle queues for fairness
    g1Queue = g1Queue.sort(() => Math.random() - 0.5);
    g2Queue = g2Queue.sort(() => Math.random() - 0.5);

    // Distribute combined labs evenly across the week
    let combinedLabSlots = [];
    if (combinedLabsList.length > 0) {
      // Only consider lab slots
      let labSlotIndices = timeSlots
        .map((slot, idx) => slot.type === "lab" ? idx : -1)
        .filter(idx => idx !== -1);
      for (let i = 0; i < combinedLabsList.length && i < labSlotIndices.length; i++) {
        let slot = labSlotIndices[Math.floor(i * labSlotIndices.length / combinedLabsList.length)];
        combinedLabSlots.push(slot);
      }
    }
    let combinedLabIdx = 0;

    // Track which labs have been assigned to each group
    let g1Assigned = new Set();
    let g2Assigned = new Set();

    // For lecture distribution
    if (!section.lectureCount) {
      section.lectureCount = {};
      subjects.forEach(sub => section.lectureCount[sub] = 0);
    }

    for (let slotIndex = 0; slotIndex < timeSlots.length; slotIndex++) {
      let slot = timeSlots[slotIndex];
      let assignedG1 = false;
      let assignedG2 = false;

      if (slot.type === "lab") {
        // Assign combined labs to their distributed slots
        if (section.groups === 2 && combinedLabSlots.includes(slotIndex) && combinedLabIdx < combinedLabsList.length) {
          let lab = combinedLabsList[combinedLabIdx++];
          if (lab.isAvailable(slot.label)) {
            lab.assignGroup(slot.label, ['G1', 'G2']);
            section.assignLabToGroup('G1', lab.name, slotIndex);
            section.assignLabToGroup('G2', lab.name, slotIndex);
            assignedG1 = true;
            assignedG2 = true;
          }
        }
        // Assign non-combined labs to G1 and G2 (ensure both get all labs, but not same at same slot)
        if (section.groups === 2 && (!assignedG1 || !assignedG2) && g1Queue.length && g2Queue.length) {
          let labG1 = g1Queue.find(lab => !g1Assigned.has(lab.name));
          let labG2 = g2Queue.find(lab => !g2Assigned.has(lab.name) && (!labG1 || lab.name !== labG1.name));
          if (!labG1) { g1Assigned.clear(); labG1 = g1Queue[0]; }
          if (!labG2) { g2Assigned.clear(); labG2 = g2Queue.find(lab => !labG1 || lab.name !== labG1.name) || g2Queue[0]; }
          if (labG1 && !assignedG1 && labG1.isAvailable(slot.label)) {
            labG1.assignGroup(slot.label, ['G1']);
            section.assignLabToGroup('G1', labG1.name, slotIndex);
            g1Assigned.add(labG1.name);
            assignedG1 = true;
          }
          if (labG2 && !assignedG2 && labG2.isAvailable(slot.label)) {
            labG2.assignGroup(slot.label, ['G2']);
            section.assignLabToGroup('G2', labG2.name, slotIndex);
            g2Assigned.add(labG2.name);
            assignedG2 = true;
          }
        }
        // For 1 group or if no labs left, assign to G1 only
        if (section.groups === 1 && !assignedG1 && g1Queue.length) {
          let lab1 = g1Queue.find(lab => !g1Assigned.has(lab.name));
          if (!lab1) { g1Assigned.clear(); lab1 = g1Queue[0]; }
          if (lab1 && lab1.isAvailable(slot.label)) {
            lab1.assignGroup(slot.label, ['G1']);
            section.assignLabToGroup('G1', lab1.name, slotIndex);
            g1Assigned.add(lab1.name);
            assignedG1 = true;
          }
        }
      } else if (slot.type === "lecture") {
        // Assign lectures only to lecture slots
        let minCount = Math.min(...subjects.map(sub => section.lectureCount[sub]));
        let candidates = subjects.filter(sub => section.lectureCount[sub] === minCount);
        let subject = candidates[Math.floor(Math.random() * candidates.length)];
        section.assignLecture(subject, slotIndex);
        section.lectureCount[subject]++;
      }
    }
  });
}

function filterTimetableByWeek() {
    const groupsPerSection = parseInt(document.getElementById("groupsPerSection").value);
    const filteredTimetable = generatedTimetable.filter(entry => {
        if (entry.isCombinedLab) return true; // Always show combined labs
        if (!entry.group) return true; // Show lectures
        if (groupsPerSection === 1) {
            // Only show lectures and combined labs
            return false;
        }
        // For 2 groups, show G1 on odd weeks, G2 on even weeks
        return (currentWeek % 2 === 1 && entry.group === 1) ||
               (currentWeek % 2 === 0 && entry.group === 2);
    });
    displayTimetable(filteredTimetable);
}

function displayTimetable(timetable) {
    let timetableBody = document.getElementById("timetableBody");
    timetableBody.innerHTML = "";

    timetable.forEach(entry => {
        const groupClass = entry.group ? `group-${entry.group}` : "";
        const combinedClass = entry.isCombinedLab ? "combined-lab" : "";
        const sectionDisplay = entry.section + (entry.group ? ` (G${entry.group})` : '');

        let row = `<tr class="${groupClass} ${combinedClass}">
            <td>${sectionDisplay}</td>
            <td>${entry.batch}</td>
            <td>${entry.day}</td>
            <td>${entry.timeSlot}</td>
            <td>${entry.subject}</td>
            <td>${entry.type}</td>
        </tr>`;
        timetableBody.innerHTML += row;
    });

    document.getElementById("timetableResult").classList.remove("hidden");
}

// Helper Functions
function setupSubjectInputs() {
    const numSubjects = parseInt(document.getElementById("numSubjects").value);
    const numLabs = parseInt(document.getElementById("numLabs").value);

    const subjectContainer = document.getElementById("subjectInputs");
    const labContainer = document.getElementById("labInputs");

    subjectContainer.innerHTML = "";
    labContainer.innerHTML = "";

    if (numSubjects > 0) {
        document.getElementById("subjectNamesContainer").classList.remove("hidden");
        for (let i = 1; i <= numSubjects; i++) {
            subjectContainer.innerHTML += `
                <label>Subject ${i} Name:</label>
                <input type="text" id="subjectName${i}" placeholder="Enter subject name">
            `;
        }
    } else {
        document.getElementById("subjectNamesContainer").classList.add("hidden");
    }

    if (numLabs > 0) {
        document.getElementById("labNamesContainer").classList.remove("hidden");
        for (let i = 1; i <= numLabs; i++) {
            labContainer.innerHTML += `
                <label>Lab ${i} Name:</label>
                <input type="text" id="labName${i}" placeholder="Enter lab name">
            `;
        }
    } else {
        document.getElementById("labNamesContainer").classList.add("hidden");
    }
}

function formatTime(minutes) {
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    let amPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${mins.toString().padStart(2, '0')} ${amPm}`;
}

function convertToMinutes(timeString) {
    if (!timeString) return 0;
    if (timeString.includes(":")) {
        const [hours, minutes] = timeString.split(":");
        return parseInt(hours) * 60 + parseInt(minutes);
    }
    return 0;
}

function exportAsCSV() {
    const rows = [];
    const headers = ["Section", "Batch", "Day", "Time Slot", "Subject/Lab", "Type"];
    rows.push(headers.join(","));

    const tableRows = document.querySelectorAll("#timetableBody tr");
    tableRows.forEach(row => {
        const rowData = [];
        row.querySelectorAll("td").forEach(cell => {
            rowData.push(`"${cell.textContent.replace(/"/g, '""')}"`);
        });
        rows.push(rowData.join(","));
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "timetable.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function showError(message) {
    alert(message);
}