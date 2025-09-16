## Quick start

1. Ensure that you in a folder with `Dockerfile`

2. Build image:
    ```
    docker build -t app .
    ```

3. Run container:
    ```
    docker run -d --rm -p 8080:8080 app
    ```

4. Tests:
    ```
    docker exec -it app ./tests/Dijkstra.test.mjs 
    ```