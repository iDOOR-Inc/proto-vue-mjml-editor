<template>
  <div class="p-editor">
    <h1>Prototype of Vue MJML Editor</h1>
    <vue-editor v-model="content" :editor-toolbar="customToolbar" use-custom-image-handler @image-added="handleImage"
                class="p-editor__inputArea"/>
    <section>
      <h2>Preview</h2>
      <div class="p-editor__previewArea">
        <div class="p-editor__previewItem">
          <h3>Raw HTML</h3>
          <pre>{{ content }}</pre>
        </div>
        <div class="p-editor__previewButton">
          <button @click="convert">
            >>><br>
            Convert to MJML
          </button>
        </div>
        <div class="p-editor__previewItem">
          <h3>Processed MJML</h3>
          <pre>{{ mjmlContent }}</pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import {uploadImage} from "@/utils/imageUploader";

export default {
  name: 'MjmlEditor',
  data() {
    return {
      content: "",
      mjmlContent: "",
      customToolbar: [  // 全オプションはコチラ参照: https://github.com/davidroyer/vue2-editor/issues/106#issuecomment-391061184
        [{'header': 1}, {'header': 2}],
        [{'size': ['small', false, 'large', 'huge']}],
        ['bold', 'italic', 'underline', 'strike'],
        [{'color': []}, {'background': []}, 'link'],
        [{'align': ''}, {'align': 'center'}, {'align': 'right'}, {'align': 'justify'}],
        [{'list': 'ordered'}, {'list': 'bullet'}, 'blockquote'],
        ['image'],
        ['clean'],
      ],
    }
  },
  methods: {
    convert() {
      let mjmlContent = `<mj-text>`;
      const tokens = this.content.split(/(<[^>]*>)/).filter(token => token.length); // 開始タグ・中身・終了タグに分けて配列化
      const nestedTags = [];  // 現在探索中のタグとその親タグを記憶するスタック
      tokens.forEach(token => {
        if (token.match(/(<img[^>]*>)/)) {
          const mjmlImage = token.replace("img", "mj-image") + `</mj-image>`;
          if (nestedTags.length > 0) {
            nestedTags.slice().reverse().forEach(tag => { // 一旦タグを全て閉じる
              mjmlContent += `</${tag.split(" ")[0]}>`;
            });
            mjmlContent += `</mj-text>${mjmlImage}<mj-text>`; // mj-textタグを閉じて、画像を挿入し、mj-textタグを再度開く
            nestedTags.forEach(tag => { // もう一度タグを開く
              mjmlContent += `<${tag}>`;
            });
          } else {
            mjmlContent += token;
          }
        } else {
          if (token.match(/(<\/[^>]*>)/)) { // 終了タグ
            nestedTags.pop();
          } else if (token.match(/(<[^>]*>)/)) {  // 開始タグ
            const tag = token.slice(1, -1);
            if (tag !== 'br') { // スタックに現在のタグを追加 (閉じタグがないbrタグを除く)
              nestedTags.push(tag);
            }
          }
          mjmlContent += token;
        }
      });
      mjmlContent += `</mj-text>`;
      this.mjmlContent = mjmlContent;
    },
    async handleImage(file, Editor, cursorLocation, resetUploader) {
      const uploadedUrl = await uploadImage(file); // 画像をアップロードし、ソースURLを取得する処理。本プロトタイプでは何の画像を入れてもgoogleロゴになる。
      if (uploadedUrl) {
        Editor.insertEmbed(cursorLocation, 'image', uploadedUrl);
        resetUploader();
      } else {
        alert('Failed to upload image.');
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.p-editor {
  margin: 0 auto;
  max-width: 960px;
}

.p-editor__previewArea {
  display: flex;
  flex-direction: row;
  align-content: center;
  gap: 24px;
}

.p-editor__previewItem {
  width: 50%;
  max-width: 50%;
}

.p-editor__previewItem > pre {
  padding: 4px;
  min-height: 1.25rem;
  background-color: #f3f4f7;
  text-align: start;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.p-editor__previewButton {
  display: flex;
  flex-direction: row;
  align-content: center;
  margin-top: 3rem;
}

.p-editor__previewButton > button {
  height: fit-content;
  margin: auto 0;
}
</style>
