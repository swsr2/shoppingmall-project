const randomStringGenerator = () => {
    const randomString = Array.from(
        { length: 10 }, // 길이 10의 배열 생성
        () => Math.floor(Math.random() * 36).toString(36) // 0~9와 a~z를 생성
    ).join(""); // 배열을 문자열로 변환

    return randomString;
};


module.exports = randomStringGenerator;
