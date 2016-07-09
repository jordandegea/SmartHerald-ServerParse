
COPYFILES=cloud public conf Dockerfile \
app.json azuredeploy.json jsconfig.json package.json \
index.js


dist:
	mkdir -p dists/temp && \
	cp -r ${COPYFILES} dists/temp && \
	cd dists/temp && \
	zip -r `date '+%y_%m_%d__%H_%M_%S'`.zip * && \
	mv *.zip .. && \
	cd ../.. && \
	rm -Rf dists/temp

clean:
	rm -Rf dists