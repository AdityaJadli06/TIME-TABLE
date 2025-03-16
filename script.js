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
    let minClassesPerDay = parseInt(document.getElementById("minClassesPerDay").value);

    let morningStart = convertToMinutes(document.getElementById("morningStart").value);
    let morningEnd = convertToMinutes(document.getElementById("morningEnd").value);
    let eveningStart = convertToMinutes(document.getElementById("eveningStart").value);
    let eveningEnd = convertToMinutes(document.getElementById("eveningEnd").value);
    let classDuration = parseInt(document.getElementById("classDuration").value);
    let gapBetweenClasses = parseInt(document.getElementById("gapBetweenClasses").value);

    let subjects = [];
    for (let i = 1; i <= numSubjects; i++) {
        subjects.push(`Subject ${i}`);
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

    days.forEach(day => {
        if (!holidays.includes(day)) {
            sections.forEach(section => {
                let batch = assignedBatches[section];
                let startTime = batch === "Morning" ? morningStart : eveningStart;
                let endTime = batch === "Morning" ? morningEnd : eveningEnd;
                let time = startTime;

                if (!subjectTracker[day]) subjectTracker[day] = [];

                for (let i = 0; i < minClassesPerDay; i++) {
                    if (time + classDuration > endTime) break;

                    let availableSubjects = subjects.filter(sub => !subjectTracker[day].includes(sub));

                    if (availableSubjects.length === 0) subjectTracker[day] = [];

                    let subject = availableSubjects[Math.floor(Math.random() * availableSubjects.length)];
                    subjectTracker[day].push(subject);

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
