<template>
  <div class="adding_page">
    <h1>제품 수정하기</h1>
    <ImgCropper 
      v-if="cropMode" />
    <form @submit.prevent="EditProduct()">
      <div class="product_info">
        <div
          class="thumbnail"
          @click="openCropModal">
          <img
            v-if="hasImg? thumbnail : oldThumbnail"
            :style="`user-select: none;`"
            :src="croppedThumbnail" />
        </div>
        <div class="input_group">
          <label>
            <span> 제품명 *</span>
            <input
              v-model="title"
              placeholder="제품명을 적어주세요 (필수)"
              type="text" />
          </label>
          <label>
            <span> 가격 * </span>
            <input
              v-model="price"
              placeholder="가격을 적어주세요 (필수)"
              type="text" />
          </label>
          <label>
            <span> 제품 설명 * </span>
            <input
              v-model="description"
              placeholder="제품 설명을 적어주세요 (필수)"
              type="text" />
          </label>
          <label>
            <span> 태그 </span>
            <input
              v-model="tags"
              placeholder="태그을 적어주세요"
              type="text" />
          </label>
          <label class="files">
            <span> 썸네일 이미지 </span>
            <input
              type="file"
              @change="selectThumbnail" />
            <span class="upload_info"> ※ 업로드 가능 최대 용량은 1MB입니다 </span>
          </label>
        </div>
      </div> 
      <div
        v-if="preventSubmit && !overFileSize && !askEdit"
        class="error_alert">
        필수 입력내용을 작성해주세요.
      </div>
      <div
        v-if="overFileSize && !preventSubmit && !askEdit"
        class="error_alert">
        업로드 가능한 파일의 최대 용량(1MB)을 초과했습니다.
      </div>
      <div
        v-if="askEdit && !preventSubmit"
        class="error_alert">
        변경된 내용이 없어 수정할 수 없습니다.
      </div>
      <button
        class="btn"
        type="submit">
        추가하기
      </button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import ImgCropper from '~/components/ImgCropper'

export default {
  name: 'EditProduct',
  components: {
    ImgCropper
  },
  props:{
    oldTitle: {
      type: String,
      default: ''
    },
    oldPrice: {
      type: String,
      default: ''
    },
    oldDescription: {
      type: String,
      default: ''
    },
    oldTags: {
      type: Array,
      default: () => []
    },
    oldThumbnail: {
      type: String,
      default: ''
    }
  },
  data(){
    return{
      title: this.oldTitle,
      price: this.oldPrice,
      description: this.oldDescription,
      tags: this.oldTags,
      askEdit: false,
      preventSubmit: false,
      overFileSize: false,
      contentChanged: false,
      hasImg: false
    }
  },
  computed: {
    productId() {
      return this.$route.params.id
    },
    cropMode() {
      return this.$store.state.cropImage.cropMode
    },
    thumbnail() {
      return this.$store.state.cropImage.thumbnail
    },
    croppedThumbnail(){
      return this.$store.state.cropImage.croppedThumbnail
    },
  },
  created(){
    if (this.oldThumbnail) {
      this.$store.dispatch('cropImage/sendCroppedThumbnail', this.oldThumbnail)
    }
  },
  methods: {
    async EditProduct() {
     try {
       if (this.overFileSize) return //파일 크기가 크면 return
       if (this.title && this.price && this.description) { //필수내용 입력여부 확인
         this.isContentChanged() // 텍스트 변경여부 확인, 없으면 askEdit = true
         if(!this.contentChanged && !this.hasImg) { // 텍스트도 이미지도 변경내용이 없으면 return
           this.askEdit = true
           return} 
         if (this.contentChanged && !this.hasImg){ // 텍스트만 바뀌었다면...
           this.splitTags()
           const { data } = await axios({
             url: `https://asia-northeast3-heropy-api.cloudfunctions.net/api/products/${this.productId}`,
            method: 'PUT',
            headers: {
              'content-type': 'application/json',
              'apikey': 'FcKdtJs202110',
              'username': 'flex',
              'masterKey': true
             },
             data: {
              title: this.title,
              price: this.price,
              description: this.description,
              tags: this.tags,
            }
           })
        this.$router.push('/admin')
        return data
        }
        if (!this.contentChanged && this.hasImg){ // 이미지만 바뀌었다면...
           this.splitTags()
           const { data } = await axios({
             url: `https://asia-northeast3-heropy-api.cloudfunctions.net/api/products/${this.productId}`,
            method: 'PUT',
            headers: {
              'content-type': 'application/json',
              'apikey': 'FcKdtJs202110',
              'username': 'flex',
              'masterKey': true
             },
             data: {
              thumbnailBase64: this.croppedThumbnail,
            }
           })
        this.$router.push('/admin')
        return data
        }
        if (this.contentChanged && this.hasImg){ // 텍스트 + 이미지 모두 바뀌었다면...
           this.splitTags()
           const { data } = await axios({
             url: `https://asia-northeast3-heropy-api.cloudfunctions.net/api/products/${this.productId}`,
            method: 'PUT',
            headers: {
              'content-type': 'application/json',
              'apikey': 'FcKdtJs202110',
              'username': 'flex',
              'masterKey': true
             },
             data: {
              title: this.title,
              price: this.price,
              description: this.description,
              tags: this.tags,
              thumbnailBase64: this.croppedThumbnail,
            }
           })
        this.$router.push('/admin')
        return data
        }
      } 
      else { 
        this.askEdit = false
        this.preventSubmit = true
      }
      } catch(error) {
        alert(error.response.data)
      }
    },
    splitTags(){
      this.tags = this.tags.split(',').map(tag => tag.trim())
    },
    openCropModal(){
      if (this.croppedThumbnail && this.hasImg){
        this.$store.dispatch('cropImage/startCrop')
      }
    },
    selectThumbnail(event){
      this.hasImg = true //새로운 이미지가 들어왔음을 알림
      this.overFileSize = false
      const maxImgSize = 1 * 1024 * 1024 //1MB
      const { files } = event.target
      for (const file of files) {
        if (file.size > maxImgSize) {
         this.overFileSize = true
         this.preventSubmit = false
         this.askEdit = false
         return
        }
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.addEventListener('load', () => {
          this.$store.dispatch('cropImage/sendThumbnail', reader.result)
          this.$store.dispatch('cropImage/sendCroppedThumbnail', reader.result)
          this.openCropModal()
        })
      }
    },
    isContentChanged(){
      if (this.title === this.oldTitle
      && this.price === this.oldPrice
      && this.description === this.oldDescription
      && this.tags === this.oldTags) { 
      this.contentChanged = false
      }
      else this.contentChanged = true
    },
  }
}
</script>

<style lang="scss" scoped>
.adding_page{
  box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
  border-radius: 4px;
  width: 1200px;
  padding: 70px 30px;
  margin: 0 auto 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  h1{
    font-size: 32px;
    font-weight: 700;
  }
  img{
    width: 100%;
    height: 100%;
  }
  form{
    margin-top: 40px;
    width: 960px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    .product_info{
      display: flex;
      width: 100%
    }
    .thumbnail {
      width: 360px;
      height: 360px;
      background-color: $gray-background-color;
      background-image: url('../../static/null.png');
      background-size: contain;
      margin: auto 10px;
    }
    .input_group{
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 14px 30px;
      input{
        width: 100%;
        padding: 6px 10px;
        margin-top: 4px;
        border: none;
        border-radius: 4px;
        box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
      }
      label + label{
        margin-top: 18px;
      }
      .files input{
        position: relative;
        &[type=file]::file-selector-button {
        color: #fcfcfc;
        background-color: $main-color;
        border: none;
        position: absolute;
        width: 100px;
        right: -5px;
        top: 0;
        bottom: 0;
        transition: .4s;
          &:hover {
          background-color: $main-color-hover;
          }
        }
      }
      .files .upload_info{
        font-size: 12px;
        color: $gray-text-color;
      }
    }
    .error_alert{
      color: $cancel-color;
      position: absolute;
      bottom: 70px;
    }
    button{
      width: 500px;
      margin: 80px 0 0;
      background-color: $main-color;
      color: #fcfcfc;
      &:hover{
        background-color: $main-color-hover;
      }
      height: 50px;
    }
  }
}
</style>
