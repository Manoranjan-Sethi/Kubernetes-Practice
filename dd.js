addEventListener('DOMContentLoaded', () => {
  const dd = document.querySelector('.dd');
  const ddItems = dd.querySelectorAll('.dd-item');
  const ddContent = dd.querySelector('.dd-content');

  ddItems.forEach(item => {
    item.addEventListener('click', () => {
      const contentId = item.getAttribute('data-content-id');
      const content = document.getElementById(contentId);
      
      // Hide all content sections
      ddContent.querySelectorAll('.dd-content-item').forEach(c => c.style.display = 'none');
      
      // Show the selected content section
      if (content) {
        content.style.display = 'block';
      }
    });
  });
}