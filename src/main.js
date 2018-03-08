// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'onsenui/css/onsenui.css'
import 'onsenui/css/onsen-css-components.css'

import Vue from 'vue'
import VueOnsen from 'vue-onsenui'
import axios from 'axios'
import VueAxios from 'vue-axios'
import infiniteScroll from 'vue-infinite-scroll'
import VueYouTubeEmbed from 'vue-youtube-embed'
import store from './store'

Vue.config.productionTip = false

Vue.use(VueOnsen)
Vue.use(VueAxios, axios)
Vue.use(infiniteScroll)
Vue.use(VueYouTubeEmbed)

const homePage = {
  template: '#home',
  props: ['myProp']
};

const newsPage = {
  template: '#news'
};

const settingsPage = {
  template: '#settings'
};

new Vue({
  el: '#app',
  store,
  template: '#main',
  data() {
    return {
      toolbarTitle: 'Search',
      modalVisible: false,
      modal2Visible: false,
      loading: false,
      nextPageToken: '',
      label: '',
      results: [],
      history: [],
      query: '',
      labelSearch: 'You haven\'t searched for any video yet!',
      videoID: '',
      youtube: {
        ready: false,
        player: null,
        playerId: null,
        videoId: null,
        videoTitle: null,
        playerHeight: '100%',
        playerWidth: '100%',
        state: 'stopped'
      }
    };
  },
  methods: {
    md() {
      return this.$ons.platform.isAndroid()
    },
    androidSearchModal() {
      this.modalVisible = true
    },
    modal(id) {
      this.modal2Visible = true
      this.videoID = id
    },
    ready (player) {
      this.player = player
    },
    stop () {
      this.player.stopVideo()
    },
    pause () {
      this.player.pauseVideo()
    },
    playing (player) {
      // The player is playing a video.
    },
    setFocus()
    {
      this.$nextTick(() => this.$refs.search.$el.children[0].focus())
    },
    search (isNewQuery) {
      this.loading = true
      return this.$http.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: 'AIzaSyAaVxe2e6AbU3FD2pKTQh1_AySRHC1NY8I',
          type: 'video',
          maxResults: '10',
          pageToken: isNewQuery ? '' : this.nextPageToken,
          part: 'id,snippet',
          fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle,nextPageToken',
          q: this.query
        }
      })
      .then( (data) => {
        if (data.data.items.length === 0) {
          this.label = 'No results were found!'
        }
        this.listResults(data, this.nextPageToken && !isNewQuery)
        this.nextPageToken = data.data.nextPageToken
        this.loading = false
      })
      .catch( (e) => {
        console.log(e)
        this.loading = false
      })
    },
    listResults (data, append) {
      if (!append) {
        this.results.length = 0  
      }
      for (var i = data.data.items.length - 1; i >= 0; i--) {
        this.results.push({
          id: data.data.items[i].id.videoId,
          title: data.data.items[i].snippet.title,
          description: data.data.items[i].snippet.description,
          thumbnail: data.data.items[i].snippet.thumbnails.default.url,
          author: data.data.items[i].snippet.channelTitle
        })
      }
      return this.results
    },
    launch (video, archive) {
      this.launchPlayer(video.id, video.title);
      if (archive) {
      	this.archiveVideo(video);
      }
      console.log('Launched id:' + video.id + ' and title:' + video.title);
    },
    launchPlayer (id, title) {

      this.youtube.player.loadVideoById(id)
      this.youtube.videoId = id
      this.youtube.videoTitle = title
      return this.youtube
    },
    bindPlayer (elementId) {
      console.log('Binding to ' + elementId)
      this.youtube.playerId = elementId
    },
    loadPlayer () {
      if (this.youtube.ready && this.youtube.playerId) {
        if (this.youtube.player) {
          this.youtube.player.destroy()
        }
        this.youtube.player = this.createPlayer()
      }
    },
    createPlayer () {
      console.log('Creating a new Youtube player for DOM id ' + this.youtube.playerId + ' and video ' + this.youtube.videoId);
      return new YT.Player(this.youtube.playerId, {
        height: this.youtube.playerHeight,
        width: this.youtube.playerWidth,
        playerVars: {
          rel: 0,
          showinfo: 0
        }
      });
    },
    archiveVideo (video) {
      this.history.unshift(video);
      return history;
    },
    loadMore (done) {
      this.search(false).then(done)
    }
  },
  computed: {
    title() {
      return this.tabs[this.activeIndex].label
    },
    loadYoutube () {
      window.onYouTubeIframeAPIReady = () => {
        console.log('Youtube API is ready')
        youtube.ready = true
        this.bindPlayer('placeholder')
        this.loadPlayer()
        $rootScope.$apply()
      }
    }
  },
});