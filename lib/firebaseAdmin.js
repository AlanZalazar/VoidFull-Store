// firebaseAdmin.js
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "voidfull-web",
      clientEmail:
        "firebase-adminsdk-fbsvc@voidfull-web.iam.gserviceaccount.com",
      privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCzXnXbj5TMIom/
NPkuSAFYzj2tzuQh6vwKNhfV9XYP1DzqCgqP0cc6LGTEn1AfK5Zp2FUPZSlxLWmu
JOw9+fG4BOnvo0btcVXI+Q54V2VDaS77cgO7n0D1eYW9CabrOjHh7Ku5dnaOhqaE
rZI0ZSTUO35eSu8Ssbpyt9M7p2/l/bSRQdH+mRpQesavt1PEuPHD5DJ0y/3CAhwx
vJhgVETHk8ZJsYs5N18vOYDfUESVoXh6DfBiJeGIXMebidU64Hmy/CAa0xgVVq9F
KiLq1mrbBT/C3GbG9wVbzTgmeY2hUKoXGgLKH/uwrY34zUsAQCTw8Pbiy/Q0rzYB
ouRqcwe/AgMBAAECggEATqFOpjj7oD9VxkHZKF49ZOpIZJypKmtCINHUwiEwJ8FB
ENHlDmYGYaybYgx6yadIcU75/t04fRpM1R/vhj2/Jo3U5Y3cpnNECW2Q19VsGVCP
XX/+Pe4SwmmK5LNJ/p1Mx78CCrPxRgqmDcyvJpPeQMFx5LERu864rtiB24lLhvTi
TGddzq2OAAa3+aO9Rg2lpLzcs2RYlkA1rDBwPb4oNW2FjXk2nKHqmZNy5ih0Ffk1
AJY1Pr7EkhSzTZTsUA6GDTTN/qTHAkAAtR7My9DaaIZQzTRZunbzjTp0Kz0t5iWa
aEQUYGulI3h+umE/Fv3MlpCHTeYHGgk1Mf8j8azZHQKBgQD6+nGWj120BdHmejh+
ZXYEbrXFKOMJshqnx7bu27DNTpffFGszYw4JD+e0c1MgcQwZp2Zds7AJsfOG9y0L
WTnsLW2UppzPTbj4gQIMhQwPftj07v+BErdHzgaVW5izCGEAZ26yVqkzIauDjHnQ
jfgL3zsu8AYqggZMG3pg3UpxNQKBgQC29TiHsR+Z3toCaNUhRDNJe9lrXXaxDqdr
LdoDg7wpwvjR+nh/CT8Llr6pKUaV4TdJdzu92rA//LdA3L9S9r+GKxeaWB07Ag1m
qrZGu5FoFetG442jHtricCSxmI1S4Uum6ECUor516SyWaVCC5WZkwylE9QvclD/R
nHIpTjKHowKBgCfP6ozTmS2hbrZ81NFYDuyNE1B/N+Sl2AydZatmNhmbSgQdHRQ9
tlBBsaOyV5Fh3WWEZHygsGAZVmQmeYK/WKzaV/Ooql9IGPtym3yY7lzW5luUPfuf
mGtPh0PSD9r2jUyfG7Q2gwiVYruvYPNwUdSwSJcdhBziG1WfVj5fXBuxAoGAIk0h
VxdXJGMKno8G/mCp+On2XlG8kf98VfTXvfbxzSaXvc5mzvJt1n9hqZdqe2kpE2X+
Vl7s0mJP/SIl4KkQSVhE6ZQBjvGYj5oL6ID8BvatELJS+LUtNmzuBDnkrRg+NcGv
ce59JOAdkumVxaS6qMOKNjp3Cdjliif5o1Lc2F8CgYEA3zMk++IMI+TvYC+6oO8T
cVvHphxnvxBhSN6cuSvBsbEYS7hKW7fpZMp7EgkOQQwfDeD8opQoLgJ1TtbfPuFD
19mWLy7GO9nZfNNXVIBfvbz64P0kHBhFGwER79ZVULjWXE0AAuBt6lC8S3Ttua3b
RkHM4YR4V3uxR6f/v369pOY=
-----END PRIVATE KEY-----`,
    }),
  });
}

const dbAdmin = admin.firestore();

export { dbAdmin };
