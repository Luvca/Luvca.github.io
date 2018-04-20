---
title: GitHub Pages でのブログ環境作成手順
tags: [GitHub Pages]
date: 2018-04-20 20:20:24
published: true
---
思いのほか簡単に GitHub Pages でブログを作成できたので、僕がやった手順を簡単にメモしておきます。

## GitHub にサインインしてリポジトリを作成
[GitHub](https://github.com) にサインイン (またはサインアップ) して`ユーザー名.github.io`という名前のリポジトリを作成する。

## PC に git をインストール
Ubuntu は`sudo apt-get install git`でインストール、Windows は [git for windows](https://gitforwindows.org) からダウンロードしてインストール、Mac は初めから入っているやつを使うか`brew install git`でインストール。

## PC で使う SSH キーペアを作成し公開鍵を GitHub に登録
```sh
mkdir -p ~/.ssh
cd !$
ssh-keygen -t rsa -b 4096 -f GitHub_rsa -C ""
```
パスフレーズはなし。  
SSH に使う鍵はサイトごとに変えたいので (たぶん気持ちの問題?)、`-f`でわかりやすいファイル名をつけるようにしている。またその場合、~/.ssh/config ファイルを作成し、に以下のような内容を追記する。  
~~~sh
Host github github.com
    HostName github.com
    IdentityFile ~/.ssh/GitHub_rsa
    User git
~~~
鍵ファイルが作成できたら [GitHub](https://github.com) (Desktop version) の右上アバター画像から _Settings_>_SSH and GPG keys_ に進み、_New SSH key_ ボタンをクリックして適当な名前をつけて公開鍵ファイルの内容をコピペして _Add SSH key_ する。

## PC の git でテンプレートをclone
これが本題。  
サイトの構造を一から作成するのはしんどそうなので、良さげなテーマを見つけてそれを clone してリネームしてベースを作成。  
ちなみに僕が選んだテーマは [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/) というシンプルなのが逆にカッコいいやつ。
~~~sh
git clone --depth 1 -b master https://github.com/mmistakes/minimal-mistakes.git
mv minimal-mistakes Luvca.github.io
cd !$
rm -rf .git
git init
git config user.name "Luvca"
git config user.email "committer@luvca.local"
git remote add origin https://github.com/Luvca/Luvca.github.io.git
git add --all
git commit -m "Init"
git push origin master
~~~
`git config`で指定する名前とメールアドレスはなんでもいいけど、GitHub のサインアップに使ったメールアドレスにすると GitHub 側で設定をいじらないといけないので、いつも適当なものを指定している。

以上でおしまい。  
この後、iPhone から投稿ができるようにもしました。それはまた別の記事で書こうと思います。