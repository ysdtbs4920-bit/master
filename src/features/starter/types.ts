/**
 * サンプルページに渡すデータの形を定義します。
 * sectionsはカードの配列。idは識別名、titleは見出し、bodyは本文です。
 * ここは型の定義だけなので、表示する文章はstarter-data.jsonに書きます。
 */

export type StarterPageData = {
  title: string;
  description: string;
  sections: {
    id: string;
    title: string;
    body: string;
  }[];
};
