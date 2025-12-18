document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    const res = await fetch('/activities');
    if (!res.ok) throw new Error('Failed to load activities');
    return res.json();
  }

  function createParticipantList(participants) {
    const container = document.createElement('div');
    container.className = 'participants';

    const title = document.createElement('h5');
    title.textContent = 'Participants';
    container.appendChild(title);

    if (!participants || participants.length === 0) {
      const none = document.createElement('div');
      none.className = 'none';
      none.textContent = 'No participants yet.';
      container.appendChild(none);
      return container;
    }

    const ul = document.createElement('ul');
    participants.forEach(p => {
      const li = document.createElement('li');
      li.textContent = p;
      ul.appendChild(li);
    });
    container.appendChild(ul);
    return container;
  }

  function renderActivities(activities) {
    activitiesList.innerHTML = '';
    // populate select options
    Object.keys(activities).forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });

    // render cards
    Object.entries(activities).forEach(([name, data]) => {
      const card = document.createElement('div');
      card.className = 'activity-card';

      const h4 = document.createElement('h4');
      h4.textContent = name;
      card.appendChild(h4);

      const desc = document.createElement('p');
      desc.textContent = data.description;
      card.appendChild(desc);

      const sched = document.createElement('p');
      sched.innerHTML = `<strong>Schedule:</strong> ${data.schedule}`;
      card.appendChild(sched);

      const cap = document.createElement('p');
      cap.innerHTML = `<strong>Capacity:</strong> ${data.participants.length} / ${data.max_participants}`;
      card.appendChild(cap);

      // participants list
      const partList = createParticipantList(data.participants);
      card.appendChild(partList);

      activitiesList.appendChild(card);
    });
  }

  function showMessage(text, kind='info') {
    messageDiv.className = `message ${kind}`;
    messageDiv.textContent = text;
    messageDiv.classList.remove('hidden');
    setTimeout(() => messageDiv.classList.add('hidden'), 4000);
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const activity = document.getElementById("activity").value;
    if (!email || !activity) return showMessage('Please provide email and select an activity.', 'error');

    try {
      const res = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Signup failed');
      }
      const body = await res.json();
      showMessage(body.message, 'success');

      // Refresh activities and re-render (simple approach)
      const activities = await fetchActivities();
      renderActivities(activities);
      signupForm.reset();
    } catch (err) {
      showMessage(err.message || 'Error during signup', 'error');
    }
  });

  // Initialize app
  (async () => {
    try {
      const activities = await fetchActivities();
      renderActivities(activities);
    } catch (err) {
      activitiesList.innerHTML = `<p class="error">Unable to load activities.</p>`;
    }
  })();
});
