var app = new Vue({
  el: '#app',
  data: {
    name: ''
  },
  methods: {
    writeName: function(event) {
        this.name = event.target.value;
    }
  }
})