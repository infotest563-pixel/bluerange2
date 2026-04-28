// Contact Form 7 Handler for Next.js Headless WordPress
// Uses event delegation so it works for both static and dynamically rendered forms
(function () {
  'use strict';

  var WP_API = 'https://dev-bluerange.pantheonsite.io/wp-json/contact-form-7/v1/contact-forms';

  function handleSubmit(form, e) {
    e.preventDefault();
    e.stopPropagation();

    // Skip React-managed forms (they handle their own submission)
    if (form.dataset.s3form || form.dataset.reactform) return;

    var formData = new FormData(form);
    var submitButton = form.querySelector('input[type="submit"], button[type="submit"]');
    var responseOutput = form.querySelector('.wpcf7-response-output');
    var originalValue = submitButton ? submitButton.value : 'Send';

    // Get form ID from hidden field
    var formId = formData.get('_wpcf7');

    if (!formId) {
      // Try reading directly from the hidden input in the DOM
      var hiddenInput = form.querySelector('input[name="_wpcf7"]');
      formId = hiddenInput ? hiddenInput.value : null;
    }

    if (!formId) {
      // No form ID — silently skip, do not log error
      return;
    }

    // Disable submit button
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.value = 'Sending...';
    }

    // Clear previous messages
    if (responseOutput) {
      responseOutput.innerHTML = '';
      responseOutput.style.display = 'none';
      responseOutput.classList.remove('wpcf7-mail-sent-ok', 'wpcf7-mail-sent-ng', 'wpcf7-validation-errors');
    }

    fetch(WP_API + '/' + formId + '/feedback', {
      method: 'POST',
      body: formData
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.value = originalValue;
        }

        if (responseOutput) {
          responseOutput.innerHTML = data.message || 'Thank you for your message!';
          responseOutput.style.display = 'block';

          if (data.status === 'mail_sent') {
            responseOutput.classList.add('wpcf7-mail-sent-ok');
            form.reset();
          } else if (data.status === 'validation_failed') {
            responseOutput.classList.add('wpcf7-validation-errors');
          } else {
            responseOutput.classList.add('wpcf7-mail-sent-ng');
          }
        }

        // Show inline validation errors
        if (data.invalid_fields) {
          data.invalid_fields.forEach(function (field) {
            var input = form.querySelector('[name="' + field.field + '"]');
            if (input) {
              var existing = input.parentNode.querySelector('.wpcf7-not-valid-tip');
              if (existing) existing.remove();
              var span = document.createElement('span');
              span.className = 'wpcf7-not-valid-tip';
              span.textContent = field.message;
              input.parentNode.appendChild(span);
              input.classList.add('wpcf7-not-valid');
            }
          });
        }
      })
      .catch(function () {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.value = originalValue;
        }
        if (responseOutput) {
          responseOutput.innerHTML = 'An error occurred. Please try again.';
          responseOutput.classList.add('wpcf7-mail-sent-ng');
          responseOutput.style.display = 'block';
        }
      });
  }

  // Event delegation — listen on document so dynamically added forms also work
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (
      form.tagName === 'FORM' &&
      form.classList.contains('wpcf7-form') &&
      !form.dataset.s3form &&
      !form.dataset.reactform
    ) {
      handleSubmit(form, e);
    }
  }, true); // capture phase so we run before other handlers

  // Clear validation errors on input (delegated)
  document.addEventListener('input', function (e) {
    var input = e.target;
    if (!input || !input.closest) return;
    var form = input.closest('.wpcf7-form');
    if (!form) return;
    input.classList.remove('wpcf7-not-valid');
    var tip = input.parentNode && input.parentNode.querySelector('.wpcf7-not-valid-tip');
    if (tip) tip.remove();
  });

})();
