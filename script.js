// Global variables
let currentWeek = 1;
let generatedTimetable = [];
let weekPattern = []; // Tracks which group has labs each week

// DOM Event Listeners
document.getElementById("timetableForm").addEventListener("submit", function (event) {
    event.preventDefault();
    generateTimetable();
});

document.getElementById("resetButton").addEventListener("click", function () {
    document.getElementById("timetableBody").innerHTML = "";
    document.getElementById("timetableResult").classList.add("hidden");
    currentWeek = 1;
});

<<<<<<< HEAD
document.getElementById("prevWeek").addEventListener("click", function() {
    if (currentWeek > 1) {
        currentWeek--;
        updateWeekDisplay();
        filterTimetableByWeek();
    }
});

document.getElementById("nextWeek").addEventListener("click", function() {
    currentWeek++;
    updateWeekDisplay();
    filterTimetableByWeek();
});
=======
>>>>>>> 6438b86 (Your commit message)

document.getElementById("numSubjects").addEventListener("change", setupSubjectInputs);
document.getElementById("numLabs").addEventListener("change", setupSubjectInputs);
document.getElementById("exportCSV").addEventListener("click", exportAsCSV);

// Main Functions
function generateTimetable() {
    // Reset tracking variables
    currentWeek = 1;
    generatedTimetable = [];
    weekPattern = [];
    
    // Get input values
    const numSections = parseInt(document.getElementById("numSections").value);
    const sectionRange = document.getElementById("sectionRange").value.toUpperCase().split("-");
    const numSubjects = parseInt(document.getElementById("numSubjects").value);
    const numLabs = parseInt(document.getElementById("numLabs").value);
    const groupsPerSection = parseInt(document.getElementById("groupsPerSection").value);
    const combinedLabsInput = document.getElementById("combinedLabs").value;
    const combinedLabs = combinedLabsInput ? combinedLabsInput.split(',').map(lab => lab.trim()) : [];
    const minClassesPerDay = parseInt(document.getElementById("minClassesPerDay").value);

    // Time-related inputs
    const morningStart = convertToMinutes(document.getElementById("morningStart").value);
    const eveningStart = convertToMinutes(document.getElementById("eveningStart").value);
    const breakStart = convertToMinutes(document.getElementById("breakStart").value);
    const breakEnd = convertToMinutes(document.getElementById("breakEnd").value);
    const classDuration = parseInt(document.getElementById("classDuration").value);
    const labDuration = parseInt(document.getElementById("labDuration").value);
    const gapBetweenClasses = parseInt(document.getElementById("gapBetweenClasses").value);

<<<<<<< HEAD
=======
    if (isNaN(numSections) || numSections <= 0) {
        console.error("Invalid number of sections.");
        return;
    }

    if (sectionRange.length !== 2 || sectionRange[0].length !== 1 || sectionRange[1].length !== 1) {
        console.error("Invalid section range. Please use the format A-D.");
        return;
    }

    if (isNaN(numSubjects) || numSubjects <= 0) {
        console.error("Invalid number of subjects.");
        return;
    }

    if (isNaN(numLabs) || numLabs <= 0) {
        console.error("Invalid number of labs.");
        return;
    }

    if (isNaN(morningStart) || isNaN(eveningStart) || isNaN(breakStart) || isNaN(breakEnd)) {
        console.error("Invalid time inputs.");
        return;
    }

>>>>>>> 6438b86 (Your commit message)
    // Generate sections
    let sections = [];
    if (sectionRange.length === 2) {
        let startChar = sectionRange[0].charCodeAt(0);
        let endChar = sectionRange[1].charCodeAt(0);
        for (let i = startChar; i <= endChar; i++) {
            sections.push(String.fromCharCode(i));
        }
    }

    // Generate subjects and labs with custom names if available
    let subjects = [];
    for (let i = 1; i <= numSubjects; i++) {
        const subjectInput = document.getElementById(`subjectName${i}`);
        subjects.push(subjectInput ? subjectInput.value || `Subject ${i}` : `Subject ${i}`);
    }

    let labs = [];
    for (let i = 1; i <= numLabs; i++) {
        const labInput = document.getElementById(`labName${i}`);
        labs.push(labInput ? labInput.value || `Lab ${i}` : `Lab ${i}`);
    }

<<<<<<< HEAD
=======
    if (!labs || labs.length === 0) {
        console.error("Labs are not initialized properly.");
        return;
    }

    if (!sections || sections.length === 0) {
        console.error("Sections are not initialized properly.");
        return;
    }

    if (!subjects || subjects.length === 0) {
        console.error("Subjects are not initialized properly.");
        return;
    }

    console.log("Labs:", labs);
    console.log("Sections:", sections);
    console.log("Subjects:", subjects);

>>>>>>> 6438b86 (Your commit message)
    // Initialize tracking objects
    let timetable = [];
    let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let holidays = Array.from(document.querySelectorAll('input[name="holiday"]:checked')).map(cb => cb.value);

    let assignedBatches = {};
    let toggleBatch = true;
    sections.forEach(section => {
        assignedBatches[section] = toggleBatch ? "Morning" : "Evening";
        toggleBatch = !toggleBatch;
    });

<<<<<<< HEAD
    let labTracker = {};
    let labAssignmentCount = {};
    let sectionLabCount = {};
    let totalLabsAssigned = 0;
    const totalLabsNeeded = sections.length * numLabs;
    sections.forEach(section => sectionLabCount[section] = 0);
=======
    let labTracker = {}; // Tracks labs assigned per day
    let labAssignmentCount = {}; // Tracks how many times each lab is assigned
    let sectionGroupLabCount = {}; // Tracks how many labs each group in a section has been assigned
    let totalLabsAssigned = 0;
    const totalLabsNeeded = sections.length * groupsPerSection * numLabs;

    // Initialize lab count for each group in each section
    sections.forEach(section => {
        sectionGroupLabCount[section] = {};
        for (let group = 1; group <= groupsPerSection; group++) {
            sectionGroupLabCount[section][group] = 0;
        }
    });
>>>>>>> 6438b86 (Your commit message)
    labs.forEach(lab => labAssignmentCount[lab] = 0);

    // Generate timetable
    days.forEach(day => {
        if (!holidays.includes(day)) {
            sections.forEach(section => {
<<<<<<< HEAD
                let batch = assignedBatches[section];
                let startTime = batch === "Morning" ? morningStart : eveningStart;
                let time = startTime;
                let subjectTrackerForSection = [];

                for (let i = 0; i < minClassesPerDay; i++) {
                    if (time >= breakStart && time < breakEnd) {
                        time = breakEnd;
                    }

                    if (time >= startTime + 8 * 60) break;

                    // Decide whether to schedule a lab
                    let isLab = Math.random() < 0.3 && sectionLabCount[section] < numLabs && totalLabsAssigned < totalLabsNeeded;
                    
                    if (isLab) {
                        let lab;
                        const isCombinedLab = false;
                        let group = null;

                        // Find available labs
                        let availableLabs = labs.filter(l => 
                            !labTracker[day]?.includes(l) && 
                            labAssignmentCount[l] < Math.ceil(totalLabsNeeded / labs.length)
                        );

                        if (availableLabs.length > 0) {
                            lab = availableLabs[Math.floor(Math.random() * availableLabs.length)];
                            const isCombinedLab = combinedLabs.includes(lab);
                            
                            if (!isCombinedLab && groupsPerSection === 2) {
                                // Alternate groups for labs (G1 or G2)
                                group = sectionLabCount[section] % 2 === 0 ? 1 : 2;
                            }

                            labTracker[day] = labTracker[day] || [];
                            labTracker[day].push(lab);
                            labAssignmentCount[lab]++;
                            sectionLabCount[section]++;
                            totalLabsAssigned++;

                            let timeSlot = `${formatTime(time)} - ${formatTime(time + labDuration)}`;
                            timetable.push({
                                section: section,
                                batch: batch,
                                day: day,
                                timeSlot: timeSlot,
                                subject: lab,
                                isLab: true,
                                isCombinedLab: isCombinedLab,
                                group: group,
                                type: isCombinedLab ? "Combined Lab" : group ? `Lab (G${group})` : "Lab"
                            });

                            time += labDuration + gapBetweenClasses;
                            continue;
                        }
                    }

                    // Subject assignment
                    let availableSubjects = subjects.filter(sub => 
                        !subjectTrackerForSection.includes(sub)
                    );
                    if (availableSubjects.length === 0) subjectTrackerForSection = [];

                    let subject = availableSubjects[Math.floor(Math.random() * availableSubjects.length)] || 
                                 subjects[Math.floor(Math.random() * subjects.length)];

                    subjectTrackerForSection.push(subject);

                    let timeSlot = `${formatTime(time)} - ${formatTime(time + classDuration)}`;
                    timetable.push({
                        section: section,
                        batch: batch,
                        day: day,
                        timeSlot: timeSlot,
                        subject: subject,
                        isLab: false,
                        type: "Lecture"
                    });

                    time += classDuration + gapBetweenClasses;
=======
                for (let group = 1; group <= groupsPerSection; group++) {
                    let batch = assignedBatches[section];
                    let startTime = batch === "Morning" ? morningStart : eveningStart;
                    let time = startTime;
                    let subjectTrackerForGroup = [];

                    for (let i = 0; i < minClassesPerDay; i++) {
                        if (time >= breakStart && time < breakEnd) {
                            time = breakEnd;
                        }

                        if (time >= startTime + 8 * 60) break; // Prevents infinite loops

                        // Decide whether to schedule a lab
                        let isLab = Math.random() < 0.5 && // Increase probability
                            sectionGroupLabCount[section][group] < numLabs &&
                            totalLabsAssigned < totalLabsNeeded;

                        if (isLab) {
                            let combinedLab = null;

                            // Check for combined labs first
                            combinedLab = labs.find(l =>
                                combinedLabs.includes(l) &&
                                !labTracker[day]?.includes(l) &&
                                labAssignmentCount[l] < Math.ceil(totalLabsNeeded / labs.length)
                            );

                            if (combinedLab) {
                                console.log("Assigning combined lab:", combinedLab);
                                labTracker[day] = labTracker[day] || [];
                                labTracker[day].push(combinedLab);
                                labAssignmentCount[combinedLab]++;
                                sections.forEach(sec => {
                                    for (let grp = 1; grp <= groupsPerSection; grp++) {
                                        sectionGroupLabCount[sec][grp]++;
                                    }
                                });
                                totalLabsAssigned += sections.length * groupsPerSection;

                                let timeSlot = `${formatTime(time)} - ${formatTime(time + labDuration)}`;
                                sections.forEach(sec => {
                                    for (let grp = 1; grp <= groupsPerSection; grp++) {
                                        timetable.push({
                                            section: sec,
                                            group: grp,
                                            batch: assignedBatches[sec],
                                            day: day,
                                            timeSlot: timeSlot,
                                            subject: combinedLab,
                                            isLab: true,
                                            isCombinedLab: true,
                                            type: "Combined Lab"
                                        });
                                    }
                                });

                                time += labDuration + gapBetweenClasses;
                                continue;
                            }

                            // Assign separate labs for the current group if no combined lab is available
                            let availableLabs = labs.filter(l =>
                                !labTracker[day]?.includes(l) &&
                                labAssignmentCount[l] < Math.ceil(totalLabsNeeded / labs.length)
                            );

                            if (availableLabs.length > 0) {
                                let lab = availableLabs[0];

                                labTracker[day] = labTracker[day] || [];
                                labTracker[day].push(lab);
                                labAssignmentCount[lab]++;
                                sectionGroupLabCount[section][group]++;
                                totalLabsAssigned++;

                                console.log("Section:", section, "Group:", group, "Lab Count:", sectionGroupLabCount[section][group]);
                                console.log("Total Labs Assigned:", totalLabsAssigned, "Total Labs Needed:", totalLabsNeeded);
                                console.log("Available Labs:", availableLabs);
                                console.log("Combined Labs:", combinedLabs);
                                console.log("Lab Tracker for Day:", day, labTracker[day]);

                                console.log("Generating timetable for section:", section, "group:", group);
                                console.log("Day:", day, "Time:", time, "Lab:", lab, "Subject:", subject);

                                let timeSlot = `${formatTime(time)} - ${formatTime(time + labDuration)}`;
                                timetable.push({
                                    section: section,
                                    group: group,
                                    batch: batch,
                                    day: day,
                                    timeSlot: timeSlot,
                                    subject: lab,
                                    isLab: true,
                                    type: "Lab"
                                });

                                time += labDuration + gapBetweenClasses;
                                continue;
                            }
                        }

                        // Subject assignment
                        let availableSubjects = subjects.filter(sub =>
                            !subjectTrackerForGroup.includes(sub)
                        );
                        if (availableSubjects.length === 0) subjectTrackerForGroup = [];

                        let subject = availableSubjects[Math.floor(Math.random() * availableSubjects.length)] ||
                            subjects[Math.floor(Math.random() * subjects.length)];

                        subjectTrackerForGroup.push(subject);

                        console.log("Generating timetable for section:", section, "group:", group);
                        console.log("Day:", day, "Time:", time, "Lab:", lab, "Subject:", subject);

                        let timeSlot = `${formatTime(time)} - ${formatTime(time + classDuration)}`;
                        timetable.push({
                            section: section,
                            group: group,
                            batch: batch,
                            day: day,
                            timeSlot: timeSlot,
                            subject: subject,
                            isLab: false,
                            type: "Lecture"
                        });

                        time += classDuration + gapBetweenClasses;
                    }
>>>>>>> 6438b86 (Your commit message)
                }
            });
        }
    });

    generatedTimetable = timetable;
    updateWeekDisplay();
    filterTimetableByWeek();
    document.getElementById("exportCSV").classList.remove("hidden");
}

function filterTimetableByWeek() {
<<<<<<< HEAD
    const groupsPerSection = parseInt(document.getElementById("groupsPerSection").value);
    const filteredTimetable = generatedTimetable.filter(entry => {
        // Always show combined labs and regular subjects
        if (!entry.isLab || entry.isCombinedLab) return true;
        
        // For non-combined labs, show based on current week and group
        if (groupsPerSection === 2) {
            return (currentWeek % 2 === 1 && entry.group === 1) || 
                   (currentWeek % 2 === 0 && entry.group === 2);
        }
        return true;
    });
    
    displayTimetable(filteredTimetable);
}

function displayTimetable(timetable) {
    let timetableBody = document.getElementById("timetableBody");
=======
    // Display the full timetable without filtering
    displayTimetable(generatedTimetable);
}

function displayTimetable(timetable) {
    const timetableBody = document.getElementById("timetableBody");
    if (!timetableBody) {
        console.error("Timetable body element not found.");
        return;
    }

    console.log("Generated Timetable:", timetable);
    
>>>>>>> 6438b86 (Your commit message)
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

function updateWeekDisplay() {
    const weekIndicator = document.getElementById("weekIndicator");
<<<<<<< HEAD
    const groupsPerSection = parseInt(document.getElementById("groupsPerSection").value);
    
    if (groupsPerSection === 2) {
        const group = currentWeek % 2 === 1 ? "G1" : "G2";
        weekIndicator.textContent = `Week ${currentWeek} (${group} Labs)`;
    } else {
        weekIndicator.textContent = `Week ${currentWeek}`;
=======
    if (weekIndicator) {
        weekIndicator.textContent = "Full Timetable"; // Static message
>>>>>>> 6438b86 (Your commit message)
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 6438b86 (Your commit message)
