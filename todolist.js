document.addEventListener("DOMContentLoaded", function () {
  var links = document.querySelectorAll("#menu .nav-links li a");

  // Adicione um evento de clique a cada link
  links.forEach(function (link) {
    link.addEventListener("click", function (event) {
      // Evita o comportamento padrão de navegação
      event.preventDefault();

      // Remova a classe 'selected' de todos os <li> da lista
      var listItems = document.querySelectorAll("#menu .nav-links li");
      listItems.forEach(function (item) {
        item.classList.remove("selected");
      });

      // Adicione a classe 'selected' ao <li> pai do link clicado
      var parentLi = link.parentNode;
      parentLi.classList.add("selected");
    });
  });

  document.getElementById("tasks-content").style.display = "none";
  fetchTasks();
  if (!localStorage.getItem("last_date")) {
    localStorage.setItem("last_date", 0);
  }
  // document.getElementById("yesterday").addEventListener("click", function () {
  //   filterByDate(-1);
  //   localStorage.setItem("last_date", -1);
  // });

  document.getElementById("today").addEventListener("click", function () {
    document.getElementById("home-content").style.display = "none";
    document.getElementById("tasks-content").style.display = "block";
    let offset = 0;
    filterByDate(offset);
    localStorage.setItem("last_date", offset);
  });

  // document.getElementById("tomorrow").addEventListener("click", function () {
  //   filterByDate(1);
  //   localStorage.setItem("last_date", 1);
  // });

  document.getElementById("routine").addEventListener("click", function () {
    document.getElementById("home-content").style.display = "none";
    document.getElementById("tasks-content").style.display = "block";
    filterByType("routine");
    localStorage.setItem("last_date", -1);
  });

  document.getElementById("important").addEventListener("click", function () {
    document.getElementById("home-content").style.display = "none";
    document.getElementById("tasks-content").style.display = "block";
    filterByPriority("high");
    localStorage.setItem("last_date", -1);
  });

  document.getElementById("all").addEventListener("click", function () {
    document.getElementById("home-content").style.display = "none";
    document.getElementById("tasks-content").style.display = "block";
    noFilter();
    localStorage.setItem("last_date", -1);
  });

  document.getElementById("completed").addEventListener("click", function () {
    document.getElementById("home-content").style.display = "none";
    document.getElementById("tasks-content").style.display = "block";
    filterByCompleted("1");
    localStorage.setItem("last_date", -1);
  });

  document.getElementById("home").addEventListener("click", function () {
    document.getElementById("home-content").style.display = "block";
    document.getElementById("tasks-content").style.display = "none";
    localStorage.setItem("last_date", -1);
  });
});

function fetchTasks() {
  fetch("todolist.php?action=fetch")
    .then((response) => response.json())
    .then((data) => {
      // renderTasks(data.routine, "routine-list", false);
      // renderTasks(data.daily, "daily-list", true);
      let lastDate = parseInt(localStorage.getItem("last_date"));
      filterByDate(lastDate);
    });
}

function filterByDate(offset) {
  console.log(offset);
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const formattedDate = date.toISOString().split("T")[0];

  fetch(`todolist.php?action=fetch_by_date&date=${formattedDate}`)
    .then((response) => response.json())
    .then((data) => {
      // renderTasks(data.routine, "routine-list", false); // Routine tasks não são afetadas
      // renderTasks(data.daily, "daily-list", true); // Somente as daily tasks são atualizadas
      renderTasks(data.daily, "tasks-list", true); // Somente as daily tasks são atualizadas
    });
}

function filterByType(type) {
  console.log(type);

  fetch(`todolist.php?action=fetch_by_type&type=${type}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      renderTasks(data, "tasks-list", true);
    });
}

function filterByPriority(priority) {
  console.log(priority);

  fetch(`todolist.php?action=fetch_by_priority&priority=${priority}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      renderTasks(data, "tasks-list", true);
    });
}

function noFilter() {
  fetch(`todolist.php?action=fetch_all`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      renderTasks(data, "tasks-list", true);
    });
}

function filterByCompleted(completed) {
  console.log(completed);

  fetch(`todolist.php?action=fetch_by_completed&completed=${completed}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      renderTasks(data, "tasks-list", true);
    });
}

function renderTasks(tasks, listId, showPriority) {
  const list = document.getElementById(listId);
  list.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    if (task.priority) li.classList.add(task.priority || "");
    li.setAttribute("data-id", task.id);

    const formattedDate = formatDateTime(task.date, task.time);

    li.innerHTML = `
          <div class="task-wrapper">
              <input type="checkbox" ${
                task.completed == 1 ? "checked" : ""
              } onchange="toggleTask(this, ${task.id})">
              <div class="task-content">
                  <h3 contenteditable="true" onblur="updateTask(${
                    task.id
                  }, this.innerText)">${task.name}</h3>
                  <p>${formattedDate}</p>
              </div>
          </div>
          <button class="remove" onclick="deleteTask(${task.id})">✖</button>
      `;

    if (task.completed == 1) {
      li.classList.add("completed");
    }

    list.appendChild(li);
  });
}

function addTask(type) {
  const name = document.getElementById(`${type}-name`).value.trim();
  const date = document.getElementById(`${type}-date`).value;
  const time = document.getElementById(`${type}-time`).value;
  const priority =
    type === "daily" ? document.getElementById(`${type}-priority`).value : "";

  if (!name || !date || !time) {
    console.log("Please fill in all fields before adding a task.");
    return;
  }

  fetch("todolist.php?action=add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, date, time, priority, type }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // fetchTasks();
        document.getElementById(`${type}-name`).value = "";
        document.getElementById(`${type}-date`).value = "";
        document.getElementById(`${type}-time`).value = "";
        if (type === "daily") {
          document.getElementById("all").click();
        } else {
          document.getElementById("routine").click();
        }
        //   document.getElementById(`${type}-priority`).value = "medium";
        // }
      } else {
        alert("Failed to add task.");
      }
    });
}

function updateTask(id, name) {
  fetch("todolist.php?action=update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name }),
  });
}

function deleteTask(id) {
  fetch("todolist.php?action=delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  }).then(() => fetchTasks());
}

function toggleTask(checkbox, id) {
  fetch("todolist.php?action=toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  }).then(() => {
    checkbox.closest("li").classList.toggle("completed", checkbox.checked);
  });
}

function formatDateTime(dateStr, timeStr) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [year, month, day] = dateStr.split("-");
  const [hour, minute] = timeStr.split(":");

  return `${day} ${months[parseInt(month) - 1]} ${year}, ${hour}:${minute}`;
}
