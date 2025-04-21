document.getElementById("timetableForm").addEventListener("submit", function (event) {
    event.preventDefault();
    generateTimetable();
});

document.getElementById("resetButton").addEventListener("click", function () {
    document.getElementById("timetableBody").innerHTML = "";
    document.getElementById("timetableResult").classList.add("hidden");
});

function generateTimetable() {
    let numSections = parseInt(document.getElementById("numSections").value);
    let sectionRange = document.getElementById("sectionRange").value.toUpperCase().split("-");
    let numSubjects = parseInt(document.getElementById("numSubjects").value);
    let numLabs = parseInt(document.getElementById("numLabs").value);
    let minClassesPerDay = parseInt(document.getElementById("minClassesPerDay").value);

    let morningStart = convertToMinutes(document.getElementById("morningStart").value);
    let eveningStart = convertToMinutes(document.getElementById("eveningStart").value);
    let breakStart = convertToMinutes(document.getElementById("breakStart").value);
    let breakEnd = convertToMinutes(document.getElementById("breakEnd").value);
    let classDuration = parseInt(document.getElementById("classDuration").value);
    let labDuration = parseInt(document.getElementById("labDuration").value);
    let gapBetweenClasses = parseInt(document.getElementById("gapBetweenClasses").value);

    let subjects = [];
    for (let i = 1; i <= numSubjects; i++) {
        subjects.push(`Subject ${i}`);
    }

    let labs = [];
    for (let i = 1; i <= numLabs; i++) {
        labs.push(`Lab ${i}`);
    }

    let sections = [];
    if (sectionRange.length === 2) {
        let startChar = sectionRange[0].charCodeAt(0);
        let endChar = sectionRange[1].charCodeAt(0);
        for (let i = startChar; i <= endChar; i++) {
            sections.push(String.fromCharCode(i));
        }
    }

    let timetable = [];
    let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let holidays = Array.from(document.querySelectorAll('input[name="holiday"]:checked')).map(cb => cb.value);

    let assignedBatches = {};
    let toggleBatch = true;

    sections.forEach(section => {
        assignedBatches[section] = toggleBatch ? "Morning" : "Evening";
        toggleBatch = !toggleBatch;
    });

    let subjectTracker = {};
    let labTracker = {};
    let labAssignmentCount = {};
    let sectionLabCount = {}; // Tracks the number of labs assigned to each section
    let lastLabDay = {}; // Tracks the last day a lab was assigned to a section
    let totalLabsAssigned = 0; // Tracks the total number of labs assigned
    const totalLabsNeeded = sections.length * numLabs; // Total labs required across all sections
    sections.forEach(section => sectionLabCount[section] = 0);
    labs.forEach(lab => labAssignmentCount[lab] = 0);

    days.forEach(day => {
        if (!holidays.includes(day)) {
            sections.forEach(section => {
                let batch = assignedBatches[section];
                let startTime = batch === "Morning" ? morningStart : eveningStart;
                let time = startTime;

                if (!labTracker[day]) labTracker[day] = [];

                let subjectTrackerForSection = []; // Track subjects for the section on this day

                for (let i = 0; i < minClassesPerDay; i++) {
                    if (time >= breakStart && time < breakEnd) {
                        time = breakEnd; // Skip the break period
                    }

                    if (time >= startTime + 8 * 60) break; // Ensure no classes after 8 hours from start

                    // Randomly decide whether to schedule a lab or a subject
                    let isLab = Math.random() < 0.5 && sectionLabCount[section] < numLabs && totalLabsAssigned < totalLabsNeeded;

                    if (isLab) {
                        let lab;

                        let availableLabs = labs.filter(l => 
                            !labTracker[day].includes(l) && 
                            labAssignmentCount[l] < Math.ceil(totalLabsNeeded / labs.length) && // Distribute labs evenly
                            (!lastLabDay[section] || lastLabDay[section] !== day) // Avoid consecutive days
                        );

                        if (availableLabs.length > 0) {
                            lab = availableLabs[Math.floor(Math.random() * availableLabs.length)];
                        }

                        if (lab) {
                            labTracker[day].push(lab);
                            labAssignmentCount[lab]++;
                            sectionLabCount[section]++;
                            lastLabDay[section] = day; // Update the last lab day for the section
                            totalLabsAssigned++; // Increment total labs assigned

                            let timeSlot = `${formatTime(time)} - ${formatTime(time + labDuration)}`;
                            timetable.push({
                                section: section,
                                batch: batch,
                                day: day,
                                timeSlot: timeSlot,
                                subject: lab
                            });

                            time += labDuration + gapBetweenClasses;
                            continue;
                        }
                    }

                    let availableSubjects = subjects.filter(sub => 
                        !subjectTrackerForSection.includes(sub) // Avoid repeating subjects for the section on the same day
                    );
                    if (availableSubjects.length === 0) subjectTrackerForSection = [];

                    let subject = availableSubjects[Math.floor(Math.random() * availableSubjects.length)];
                    if (!subject) subject = subjects[Math.floor(Math.random() * subjects.length)]; // Fallback if no available subject

                    subjectTrackerForSection.push(subject);

                    let timeSlot = `${formatTime(time)} - ${formatTime(time + classDuration)}`;
                    timetable.push({
                        section: section,
                        batch: batch,
                        day: day,
                        timeSlot: timeSlot,
                        subject: subject
                    });

                    time += classDuration + gapBetweenClasses;
                }
            });
        }
    });

    displayTimetable(timetable);
}

function displayTimetable(timetable) {
    let timetableBody = document.getElementById("timetableBody");
    timetableBody.innerHTML = "";

    timetable.forEach(entry => {
        let row = `<tr>
            <td>${entry.section}</td>
            <td>${entry.batch}</td>
            <td>${entry.day}</td>
            <td>${entry.timeSlot}</td>
            <td>${entry.subject}</td>
        </tr>`;
        timetableBody.innerHTML += row;
    });

    document.getElementById("timetableResult").classList.remove("hidden");
}

function formatTime(minutes) {
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    let amPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${mins.toString().padStart(2, '0')} ${amPm}`;
}

function convertToMinutes(timeString) {
    let [time, period] = timeString.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
}
