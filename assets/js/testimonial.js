const testimonials = [
  {
    image:
      "https://1.bp.blogspot.com/-_e1k3uZ0Klo/Xy_hTZl6NhI/AAAAAAAABbo/3a5WIKGo8KoCYTG4ux9N_Bj_WjyR7yvcgCNcBGAsYHQ/s400/DEE4342E-364D-4008-B5E8-619E9CF24CCD.jpeg",
    content: "The Adventures",
    author: "Jimmy Neutron",
    rating: 5,
  },
  {
    image:
      "https://cdn-flnkc.nitrocdn.com/KFlCDdxHmXxwfeAbWXbVTSQOtYohfXjT/assets/images/optimized/rev-937f1dc/static.voices.com/wp-content/uploads/2022/09/open-uri20150422-20810-1uc5daw_96b0b8de_f68eb8aa-e1668010305749.jpeg",
    content: "Incredible",
    author: "Papa",
    rating: 1,
  },
  {
    image:
      "https://1.bp.blogspot.com/-1-NFUZrRXo4/Xy_ht3ZF3cI/AAAAAAAABb0/Vmw0zJZ4_l8R46wc5ildXb9JmlwuCNmcgCNcBGAsYHQ/s701/C0DF1B18-082B-48BF-BF18-618E75A83F49.jpeg",
    content: "Dragon Ball",
    author: "Goku",
    rating: 2,
  },
  {
    image:
      "https://1.bp.blogspot.com/-TiqHg7-ima8/Xy_iteHmWCI/AAAAAAAABcc/vA_R0PfQY54q3aFKKf8pDiuadDl8T40ugCNcBGAsYHQ/s700/95F423B0-88C0-4FD4-9226-0FE196AA22BF.jpeg",
    content: "OnePiece",
    author: "Monkey D'Luffy",
    rating: 3,
  },
  {
    image:
      "https://1.bp.blogspot.com/-Xcqo8OtOQgw/Xy_hfl2KX4I/AAAAAAAABbs/jbPkjUbV5bQFkpgESV5Hee3vqvLBDYUXQCNcBGAsYHQ/s640/95065F83-3704-4DD1-8292-59DEA209076C.jpeg",
    content: "Captain",
    author: "Tsubasa",
    rating: 4,
  },
];

function allTestimonial() {
  if (!testimonials.length) {
    return (document.getElementById("testimonials").innerHTML =
      `<h1>Data not found!</h1>`);
  }

  const testimonialHTML = testimonials.map((testimonial) => {
    return `<div class="testimonial">
                <img src="${testimonial.image}" class="profile-testimonial" />
                <p class="quote">"${testimonial.content}"</p>
                <p class="author">- ${testimonial.author}</p>
            </div>`;
  });

  document.getElementById("testimonials").innerHTML = testimonialHTML.join("");
}

function filterTestimonial(rating) {
  // 2
  const filteredTestimonial = testimonials.filter(
    (testimonial) => testimonial.rating == rating
  );

  if (!filteredTestimonial.length) {
    return (document.getElementById("testimonials").innerHTML =
      `<h1>Data not found!</h1>`);
  }

  const testimonialHTML = filteredTestimonial.map((testimonial) => {
    return `<div class="testimonial">
                    <img src="${testimonial.image}" class="profile-testimonial" />
                    <p class="quote">"${testimonial.content}"</p>
                    <p class="author">- ${testimonial.author}</p>
                </div>`;
  });

  document.getElementById("testimonials").innerHTML = testimonialHTML.join("");
}

allTestimonial();
