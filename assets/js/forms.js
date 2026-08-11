/**
 * Client-side validation + success/error feedback for the newsletter
 * and contact forms. Audit fix: forms previously gave no confirmation
 * after submit.
 *
 * NOTE: there is no backend wired up yet. On successful validation this
 * shows a genuine success message and resets the form, but does not
 * actually send the data anywhere. Point the <form action="..."> at your
 * email/CRM provider (e.g. Mailchimp, Formspree) when one is chosen, and
 * this script will keep working — swap the fake `submitForm()` below for
 * a real fetch() call to that endpoint.
 */
(function () {
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function showFieldError(field, message) {
    field.classList.add("has-error");
    var errorEl = field.querySelector(".field-error");
    if (errorEl) errorEl.textContent = message;
  }

  function clearFieldError(field) {
    field.classList.remove("has-error");
  }

  function submitForm(form) {
    // Placeholder "network" delay so the UI honestly reflects that
    // nothing is wired to a real backend yet.
    return new Promise(function (resolve) {
      setTimeout(resolve, 500);
    });
  }

  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    var feedback = form.querySelector(".form-feedback");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;

      form.querySelectorAll(".field[data-required]").forEach(function (field) {
        var input = field.querySelector("input, textarea, select");
        clearFieldError(field);

        if (!input.value.trim()) {
          showFieldError(field, "This field is required.");
          valid = false;
          return;
        }

        if (input.type === "email" && !isValidEmail(input.value.trim())) {
          showFieldError(field, "Enter a valid email address.");
          valid = false;
        }
      });

      if (feedback) {
        feedback.classList.remove("is-success", "is-error");
      }

      if (!valid) {
        if (feedback) {
          feedback.textContent = "Please fix the highlighted fields and try again.";
          feedback.classList.add("is-error");
        }
        return;
      }

      var submitBtn = form.querySelector('[type="submit"]');
      var originalText = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting…";
      }

      submitForm(form).then(function () {
        if (feedback) {
          feedback.textContent =
            form.getAttribute("data-success-message") || "Thank you — your submission was received.";
          feedback.classList.add("is-success");
        }
        form.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
    });
  });
})();
