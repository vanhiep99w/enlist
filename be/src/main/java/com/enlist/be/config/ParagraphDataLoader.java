package com.enlist.be.config;

import com.enlist.be.entity.Paragraph;
import com.enlist.be.repository.ParagraphRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!test")
public class ParagraphDataLoader implements CommandLineRunner {

    private final ParagraphRepository paragraphRepository;

    @Override
    public void run(String... args) {
        if (paragraphRepository.count() > 0) {
            log.info("Paragraphs already exist, skipping seed data");
            return;
        }

        log.info("Seeding paragraph data from markdown files...");
        List<Paragraph> paragraphs = loadParagraphsFromMarkdown();
        paragraphRepository.saveAll(paragraphs);
        log.info("Seeded {} paragraphs", paragraphs.size());
    }

    private List<Paragraph> loadParagraphsFromMarkdown() {
        List<Paragraph> paragraphs = new ArrayList<>();
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

        try {
            Resource[] resources = resolver.getResources("classpath:content/paragraphs/**/*.md");

            for (Resource resource : resources) {
                try {
                    Paragraph paragraph = parseMarkdownFile(resource);
                    if (paragraph != null) {
                        paragraphs.add(paragraph);
                        log.debug("Loaded paragraph: {}", paragraph.getTitle());
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse markdown file: {}", resource.getFilename(), e);
                }
            }
        } catch (Exception e) {
            log.error("Failed to load markdown files", e);
        }

        return paragraphs;
    }

    private Paragraph parseMarkdownFile(Resource resource) throws Exception {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

            StringBuilder frontmatter = new StringBuilder();
            StringBuilder content = new StringBuilder();
            boolean inFrontmatter = false;
            boolean frontmatterEnded = false;

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().equals("---")) {
                    if (!inFrontmatter && !frontmatterEnded) {
                        inFrontmatter = true;
                        continue;
                    } else if (inFrontmatter) {
                        inFrontmatter = false;
                        frontmatterEnded = true;
                        continue;
                    }
                }

                if (inFrontmatter) {
                    frontmatter.append(line).append("\n");
                } else if (frontmatterEnded) {
                    content.append(line).append("\n");
                }
            }

            Yaml yaml = new Yaml();
            Map<String, Object> metadata = yaml.load(frontmatter.toString());

            if (metadata == null) {
                log.warn("No frontmatter found in: {}", resource.getFilename());
                return null;
            }

            String title = (String) metadata.get("title");
            String topic = (String) metadata.get("topic");
            String difficulty = (String) metadata.get("difficulty");
            String paragraphContent = content.toString().trim();

            if (title == null || paragraphContent.isEmpty()) {
                log.warn("Missing required fields in: {}", resource.getFilename());
                return null;
            }

            return Paragraph.builder()
                    .title(title)
                    .topic(topic)
                    .difficulty(difficulty)
                    .content(paragraphContent)
                    .build();
        }
    }
}
