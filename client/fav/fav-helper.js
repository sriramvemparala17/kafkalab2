const fav = {
  itemTotal() {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("fav")) {
        return JSON.parse(localStorage.getItem("fav")).length;
      }
    }
    return 0;
  },
  addtofav(item, cb) {
    let fav = [];
    if (typeof window !== "undefined") {
      if (localStorage.getItem("fav")) {
        fav = JSON.parse(localStorage.getItem("fav"));
      }
      fav.push({
        product: item,
        quantity: 1,
        shop: item.shop._id,
      });

      localStorage.setItem("fav", JSON.stringify(fav));
      cb();
    }
  },
  updatefav(itemIndex, quantity) {
    let fav = [];
    if (typeof window !== "undefined") {
      if (localStorage.getItem("fav")) {
        fav = JSON.parse(localStorage.getItem("fav"));
      }
      fav[itemIndex].quantity = quantity;
      localStorage.setItem("fav", JSON.stringify(fav));
    }
  },

  getfav() {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("fav")) {
        return JSON.parse(localStorage.getItem("fav"));
      }
    }
    return [];
  },

  // async getfav(signal) {
  //   try {
  //     let response = await fetch("/api/products/latest", {
  //       method: "GET",
  //       signal: signal,
  //     });
  //     console.log(response);
  //     return response.json();
  //   } catch (err) {
  //     console.log(err);
  //   }
  // },

  removeItem(itemIndex) {
    let fav = [];
    if (typeof window !== "undefined") {
      if (localStorage.getItem("fav")) {
        fav = JSON.parse(localStorage.getItem("fav"));
      }
      fav.splice(itemIndex, 1);
      localStorage.setItem("fav", JSON.stringify(fav));
    }
    return fav;
  },
  emptyfav(cb) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("fav");
      cb();
    }
  },
};

export default fav;
